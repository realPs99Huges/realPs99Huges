"""Real-ESRGAN (realesr-general-x4v3, SRVGGNetCompact) without torch: .pth -> ONNX -> onnxruntime."""
import os, sys, pickle, zipfile
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.path.join(os.path.dirname(HERE), 'models')


def load_pth(path):
    z = zipfile.ZipFile(path)
    prefix = z.namelist()[0].split('/')[0]
    dtypes = {'FloatStorage': np.float32, 'HalfStorage': np.float16, 'LongStorage': np.int64}

    class Storage:
        def __init__(self, name): self.name = name

    def rebuild(storage, offset, size, stride, *a):
        arr = storage
        n = int(np.prod(size)) if size else 1
        flat = arr[offset:offset + (n if not stride else max(sum((s - 1) * st for s, st in zip(size, stride)) + 1, 1))]
        if not size:
            return flat.reshape(())
        return np.lib.stride_tricks.as_strided(flat, shape=size, strides=[s * arr.itemsize for s in stride]).copy()

    class U(pickle.Unpickler):
        def find_class(self, mod, name):
            if mod == 'torch._utils' and name == '_rebuild_tensor_v2':
                return rebuild
            if mod == 'torch' and name.endswith('Storage'):
                return Storage(name)
            if mod == 'collections' and name == 'OrderedDict':
                import collections
                return collections.OrderedDict
            return super().find_class(mod, name)

        def persistent_load(self, pid):
            _, st, key, loc, numel = pid
            raw = z.read(f'{prefix}/data/{key}')
            return np.frombuffer(raw, dtype=dtypes[st.name]).copy()

    return U(z.open(f'{prefix}/data.pkl')).load()


def build_onnx(out_path):
    import onnx
    from onnx import helper, TensorProto, numpy_helper
    sd = load_pth(os.path.join(MODELS, 'realesr-general-x4v3.pth'))
    sd = sd.get('params_ema', sd.get('params', sd))
    nodes, inits = [], []
    cur = 'input'
    idx = sorted({int(k.split('.')[1]) for k in sd if k.startswith('body.')})
    for i in idx:
        w = sd[f'body.{i}.weight']
        if w.ndim == 4:  # conv
            inits += [numpy_helper.from_array(w.astype(np.float32), f'w{i}'),
                      numpy_helper.from_array(sd[f'body.{i}.bias'].astype(np.float32), f'b{i}')]
            nodes.append(helper.make_node('Conv', [cur, f'w{i}', f'b{i}'], [f'c{i}'], pads=[1, 1, 1, 1]))
            cur = f'c{i}'
        else:  # prelu
            inits.append(numpy_helper.from_array(w.astype(np.float32).reshape(-1, 1, 1), f'a{i}'))
            nodes.append(helper.make_node('PRelu', [cur, f'a{i}'], [f'p{i}']))
            cur = f'p{i}'
    nodes.append(helper.make_node('DepthToSpace', [cur], ['ps'], blocksize=4, mode='CRD'))
    inits.append(numpy_helper.from_array(np.array([1, 1, 4, 4], np.float32), 'scales'))
    nodes.append(helper.make_node('Resize', ['input', '', 'scales'], ['up'], mode='nearest'))
    nodes.append(helper.make_node('Add', ['ps', 'up'], ['output']))
    g = helper.make_graph(nodes, 'srvgg', [helper.make_tensor_value_info('input', TensorProto.FLOAT, [1, 3, None, None])],
                          [helper.make_tensor_value_info('output', TensorProto.FLOAT, [1, 3, None, None])], inits)
    m = helper.make_model(g, opset_imports=[helper.make_opsetid('', 17)])
    m.ir_version = 8
    onnx.checker.check_model(m)
    onnx.save(m, out_path)


_SESS = None


def session(threads=4):
    global _SESS
    if _SESS is None:
        import onnxruntime as ort
        p = os.path.join(MODELS, 'srvgg_x4.onnx')
        if not os.path.exists(p):
            build_onnx(p)
        o = ort.SessionOptions(); o.intra_op_num_threads = threads; o.inter_op_num_threads = 1
        _SESS = ort.InferenceSession(p, o, providers=['CPUExecutionProvider'])
    return _SESS


def upscale(rgb_u8, threads=4):
    x = rgb_u8.astype(np.float32).transpose(2, 0, 1)[None] / 255.0
    y = session(threads).run(['output'], {'input': x})[0][0]
    return np.clip(y.transpose(1, 2, 0) * 255 + 0.5, 0, 255).astype(np.uint8)


if __name__ == '__main__':
    import cv2, time
    im = cv2.cvtColor(cv2.imread(sys.argv[1]), cv2.COLOR_BGR2RGB)
    t = time.time(); out = upscale(im); print('time', time.time() - t, out.shape)
    cv2.imwrite(sys.argv[2], cv2.cvtColor(out, cv2.COLOR_RGB2BGR))
