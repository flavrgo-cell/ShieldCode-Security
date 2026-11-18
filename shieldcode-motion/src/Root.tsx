import React from "react";
import { Composition, Folder } from "remotion";
import { ShieldCodePresentation } from "./Composition";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Benchmark } from "./scenes/Scene3Benchmark";
import { Scene4Solution } from "./scenes/Scene4Solution";
import { Scene5Sandbox } from "./scenes/Scene5Sandbox";
import { Scene6BusinessB2B } from "./scenes/Scene6BusinessB2B";
import { Scene7Outro } from "./scenes/Scene7Outro";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShieldCodePresentation"
        component={ShieldCodePresentation}
        durationInFrames={4605}
        fps={30}
        width={1920}
        height={1080}
      />

      <Folder name="Scenes">
        <Composition
          id="Scene1-Intro"
          component={Scene1Intro}
          durationInFrames={570}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Scene2-Problem"
          component={Scene2Problem}
          durationInFrames={705}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Scene3-Benchmark"
          component={Scene3Benchmark}
          durationInFrames={705}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Scene4-Solution"
          component={Scene4Solution}
          durationInFrames={780}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Scene5-Sandbox"
          component={Scene5Sandbox}
          durationInFrames={795}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Scene6-BusinessB2B"
          component={Scene6BusinessB2B}
          durationInFrames={690}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Scene7-Outro"
          component={Scene7Outro}
          durationInFrames={480}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  );
};
