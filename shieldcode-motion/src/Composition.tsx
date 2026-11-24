import React from "react";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { LIGHT } from "./theme";
import {
  Beat01BrandReveal,
  Beat02EdahabiaBoom,
  Beat03FakeSmsExample,
  Beat04GhostBuyer,
  Beat05ExposedDb,
  Beat06PersonalSeal,
} from "./scenes/Act1ProblemAndSeal";
import {
  Beat07InstantVerifySms,
  Beat08BiometricSelfie,
  Beat09SafeLinkGateway,
  Beat10EdahabiaZeroExposure,
  Beat11OmniChannel,
  Beat12RustNextEngine,
} from "./scenes/Act2ShieldLayersAndTech";
import {
  Beat13ZeroizeAndLaw1807,
  Beat14AlgerianEcosystem,
  Beat15ImpactGauges,
  Beat16BusinessEngines,
  Beat17RoadmapAndFinale,
} from "./scenes/Act3EcosystemImpactFinale";

// 17 Beats durations:
// B1=165, B2=180, B3=195, B4=180, B5=180, B6=195,
// B7=195, B8=195, B9=195, B10=195, B11=210, B12=195,
// B13=195, B14=195, B15=210, B16=195, B17=225
// Sum = 3300 frames.
// 16 transitions x 15 frames = 240 overlap frames.
// Exact Total = 3300 - 240 = 3060 frames (102.0 seconds @ 30fps).

const DURATIONS = [
  165, 180, 195, 180, 180, 195, 195, 195, 195, 195, 210, 195, 195, 195, 210,
  195, 225,
];

const CUT_FRAMES: number[] = [];
let acc = 0;
for (let i = 0; i < DURATIONS.length - 1; i++) {
  acc += DURATIONS[i] - 15;
  CUT_FRAMES.push(acc);
}

export const ShieldCodeExecutiveFilm: React.FC = () => {
  const BEATS = [
    { id: "01-Brand", Comp: Beat01BrandReveal, dur: 165, trans: "fade" },
    { id: "02-Boom", Comp: Beat02EdahabiaBoom, dur: 180, trans: "slide" },
    { id: "03-Smishing", Comp: Beat03FakeSmsExample, dur: 195, trans: "fade" },
    { id: "04-GhostBuyer", Comp: Beat04GhostBuyer, dur: 180, trans: "slide" },
    { id: "05-ExposedDb", Comp: Beat05ExposedDb, dur: 180, trans: "fade" },
    { id: "06-PersonalSeal", Comp: Beat06PersonalSeal, dur: 195, trans: "slide" },
    { id: "07-VerifiedSms", Comp: Beat07InstantVerifySms, dur: 195, trans: "fade" },
    { id: "08-Biometric", Comp: Beat08BiometricSelfie, dur: 195, trans: "slide" },
    { id: "09-SafeLink", Comp: Beat09SafeLinkGateway, dur: 195, trans: "fade" },
    { id: "10-ZeroExposure", Comp: Beat10EdahabiaZeroExposure, dur: 195, trans: "slide" },
    { id: "11-OmniChannel", Comp: Beat11OmniChannel, dur: 210, trans: "fade" },
    { id: "12-DualEngine", Comp: Beat12RustNextEngine, dur: 195, trans: "slide" },
    { id: "13-ZeroizeLaw", Comp: Beat13ZeroizeAndLaw1807, dur: 195, trans: "fade" },
    { id: "14-Ecosystem", Comp: Beat14AlgerianEcosystem, dur: 195, trans: "slide" },
    { id: "15-KPIs", Comp: Beat15ImpactGauges, dur: 210, trans: "fade" },
    { id: "16-Business", Comp: Beat16BusinessEngines, dur: 195, trans: "fade" },
    { id: "17-Finale", Comp: Beat17RoadmapAndFinale, dur: 225, trans: "none" },
  ] as const;

  return (
    <AbsoluteFill style={{ backgroundColor: LIGHT.canvas }}>
      <Audio src={staticFile("sfx/corporate_score.wav")} loop volume={0.34} />

      {CUT_FRAMES.map((cut) => (
        <Sequence key={cut} from={cut} durationInFrames={15} layout="none">
          <Audio src={staticFile("sfx/whoosh_soft.wav")} volume={0.22} />
        </Sequence>
      ))}

      <TransitionSeries>
        {BEATS.map((b, idx) => (
          <React.Fragment key={b.id}>
            <TransitionSeries.Sequence name={b.id} durationInFrames={b.dur}>
              <b.Comp />
            </TransitionSeries.Sequence>
            {idx < BEATS.length - 1 && (
              <TransitionSeries.Transition
                presentation={
                  b.trans === "slide"
                    ? slide({ direction: "from-left" })
                    : fade()
                }
                timing={linearTiming({ durationInFrames: 15 })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
