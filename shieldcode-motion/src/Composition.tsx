import React from "react";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { COLORS } from "./theme";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Benchmark } from "./scenes/Scene3Benchmark";
import { Scene4Solution } from "./scenes/Scene4Solution";
import { Scene5Sandbox } from "./scenes/Scene5Sandbox";
import { Scene6BusinessB2B } from "./scenes/Scene6BusinessB2B";
import { Scene7Outro } from "./scenes/Scene7Outro";

const TRANSITION_CUTS = [550, 1235, 1920, 2680, 3455, 4125];

export const ShieldCodePresentation: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgDeep }}>
      {/* Subtle Ambient Cinema Pad (Ducked beneath Voiceover) */}
      <Audio src={staticFile("audio/sfx_ambient.wav")} loop volume={0.14} />

      {/* Transition Whoosh SFX at each scene cut */}
      {TRANSITION_CUTS.map((cutFrame) => (
        <Sequence
          key={cutFrame}
          from={cutFrame}
          durationInFrames={25}
          layout="none"
        >
          <Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.28} />
        </Sequence>
      ))}

      {/* 7-Scene Presentation Timeline */}
      <TransitionSeries>
        <TransitionSeries.Sequence name="01-Intro" durationInFrames={570}>
          <Scene1Intro />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence name="02-Problem" durationInFrames={705}>
          <Scene2Problem />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence name="03-Benchmark" durationInFrames={705}>
          <Scene3Benchmark />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence name="04-Solution" durationInFrames={780}>
          <Scene4Solution />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence name="05-Sandbox" durationInFrames={795}>
          <Scene5Sandbox />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence name="06-BusinessB2B" durationInFrames={690}>
          <Scene6BusinessB2B />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence name="07-Outro" durationInFrames={480}>
          <Scene7Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
