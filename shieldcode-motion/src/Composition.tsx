import React from "react";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { PALETTE } from "./theme";
import { Slide01Hero } from "./scenes/Slide01Hero";
import { Slide02Problem } from "./scenes/Slide02Problem";
import { Slide03FourLayers } from "./scenes/Slide03FourLayers";
import { Slide04UserJourney } from "./scenes/Slide04UserJourney";
import { Slide05GlassSaaS } from "./scenes/Slide05GlassSaaS";
import { Slide06DualArch } from "./scenes/Slide06DualArch";
import { Slide07SovereignLaw } from "./scenes/Slide07SovereignLaw";
import { Slide08ProductionRoutes } from "./scenes/Slide08ProductionRoutes";
import { Slide09UseCases } from "./scenes/Slide09UseCases";
import { Slide10KPIs } from "./scenes/Slide10KPIs";
import { Slide11BusinessModel } from "./scenes/Slide11BusinessModel";
import { Slide12Roadmap } from "./scenes/Slide12Roadmap";

// Scene durations:
// S1=255, S2=300, S3=300, S4=285, S5=285, S6=285, S7=285, S8=285, S9=285, S10=270, S11=270, S12=270
// Sum = 3375 frames. 11 transitions x 18 frames = 198 overlap frames.
// Exact total = 3375 - 198 = 3177 frames (105.9s @ 30fps).
const CUT_FRAMES = [
  237,  // 255 - 18
  519,  // 237 + 300 - 18
  801,  // 519 + 300 - 18
  1068, // 801 + 285 - 18
  1335, // 1068 + 285 - 18
  1602, // 1335 + 285 - 18
  1869, // 1602 + 285 - 18
  2136, // 1869 + 285 - 18
  2403, // 2136 + 285 - 18
  2655, // 2403 + 270 - 18
  2907, // 2655 + 270 - 18
];

export const ShieldCodeExecutiveFilm: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.bgVoid }}>
      {/* Pure Corporate Instrumental Score (No Voiceover) */}
      <Audio src={staticFile("sfx/corporate_score.wav")} loop volume={0.34} />

      {/* Subtle Velvety Transition Whooshes */}
      {CUT_FRAMES.map((cut) => (
        <Sequence key={cut} from={cut} durationInFrames={18} layout="none">
          <Audio src={staticFile("sfx/whoosh_soft.wav")} volume={0.26} />
        </Sequence>
      ))}

      <TransitionSeries>
        <TransitionSeries.Sequence name="01-Hero" durationInFrames={255}>
          <Slide01Hero />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 18 })}
        />

        <TransitionSeries.Sequence name="02-Problem" durationInFrames={300}>
          <Slide02Problem />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 18 })}
        />

        <TransitionSeries.Sequence name="03-FourLayers" durationInFrames={300}>
          <Slide03FourLayers />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 18 })}
        />

        <TransitionSeries.Sequence name="04-UserJourney" durationInFrames={285}>
          <Slide04UserJourney />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 18 })}
        />

        <TransitionSeries.Sequence name="05-GlassSaaS" durationInFrames={285}>
          <Slide05GlassSaaS />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 18 })}
        />

        <TransitionSeries.Sequence name="06-DualArch" durationInFrames={285}>
          <Slide06DualArch />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 18 })}
        />

        <TransitionSeries.Sequence name="07-SovereignLaw" durationInFrames={285}>
          <Slide07SovereignLaw />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 18 })}
        />

        <TransitionSeries.Sequence name="08-ProductionRoutes" durationInFrames={285}>
          <Slide08ProductionRoutes />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 18 })}
        />

        <TransitionSeries.Sequence name="09-UseCases" durationInFrames={285}>
          <Slide09UseCases />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 18 })}
        />

        <TransitionSeries.Sequence name="10-KPIs" durationInFrames={270}>
          <Slide10KPIs />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 18 })}
        />

        <TransitionSeries.Sequence name="11-BusinessModel" durationInFrames={270}>
          <Slide11BusinessModel />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 18 })}
        />

        <TransitionSeries.Sequence name="12-Roadmap" durationInFrames={270}>
          <Slide12Roadmap />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
