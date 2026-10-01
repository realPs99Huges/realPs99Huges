# Bacon Builds — 30s cinematic cutscene

A cartoony, 30-second Roblox cutscene. Bacon drops in, claims a plot, pulls a
hammer out of his pocket, builds a classic house, dances, then goes and gawks at
the neighbour's mansion.

Everything is generated from Parts at runtime, **2000 studs above your map**, so
it does not touch your existing game geometry. No uploads, no rig assets, no
animation IDs, no plugins.

## Install (30 seconds)

1. Download **`build/BaconBuildsCutscene.rbxmx`**
2. In Roblox Studio, open the Explorer and find **StarterPlayer → StarterPlayerScripts**
3. Right-click it → **Insert from File…** → pick the `.rbxmx`
4. Press **Play**

That's it. It plays once, cleans itself up, and hands the camera back.

If you'd rather paste it by hand: make a **LocalScript** in `StarterPlayerScripts`
and paste the contents of `src/CutsceneController.client.lua` into it.

## Shot list

| Time | Shot | What happens |
|------|------|--------------|
| 00.0 | Spawn | Light beam, Bacon materialises, lands with a dust ring |
| 03.6 | The plot | Walks to the sign, slaps it — it spins and reads BACON'S PLOT, confetti |
| 07.4 | The hammer | Reaches in his pocket, an oversized cartoon mallet pops out with a boing |
| 10.4 | Build | Eleven whacks. Foundation, walls, door, two windows, roof, chimney, fence, garden, flag, mailbox — each flies in, overshoots and pops into place with dust and a camera shake |
| 19.6 | Victory | Happy dance, confetti bursts, shutters swing open, chimney smokes, flag waves, windows glow |
| 23.8 | Neighbour | Runs next door to a mansion with towers, spinning weathervanes, a fountain and waving flags |
| 26.0 | Impressed | Looks up, "WOW" bubble, sparkles |
| 28.2 | Title | BACON BUILDS + tagline, confetti, fade out |

## Tuning

Everything adjustable sits in the `CONFIG` table at the top of the script.

```lua
local CONFIG = {
	AutoPlay           = true,   -- roll as soon as the player loads
	StartDelay         = 1.0,
	BuildHeight        = 2000,   -- studs above your map
	HideLocalCharacter = true,
	OverrideLighting   = true,   -- bright cartoon lighting, restored afterwards
	ShowSkipButton     = true,
	MasterVolume       = 0.65,
	MusicId            = "",     -- paste "rbxassetid://..." for a score
	MusicVolume        = 0.35,
}
```

**Trigger it yourself** instead of on spawn — set `AutoPlay = false`, then from
any script:

```lua
workspace:SetAttribute("PlayBaconCutscene", true)
```

**Sound.** The whacks, boings, dings and whooshes use audio files that ship with
Studio (`rbxasset://sounds/...`), so they work with no upload and no moderation
wait. Swap any of them in the `SFX` table for your own asset IDs. There is no
built-in music file, so `MusicId` starts empty — paste your own uploaded track
there for the score.

**Timing.** Each build piece has a `land` time in the `group(...)` calls. Move a
number and the hammer swing, dust, sound and camera shake all follow it
automatically — they are all derived from that one value.

## Files

- `build/BaconBuildsCutscene.rbxmx` — the drop-in Studio model
- `src/CutsceneController.client.lua` — the source, if you'd rather paste or Rojo-sync
