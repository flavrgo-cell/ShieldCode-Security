import React from "react";
import { Composition, Folder } from "remotion";
import { ShieldCodeExecutiveFilm } from "./Composition";
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

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShieldCodeExecutiveFilm"
        component={ShieldCodeExecutiveFilm}
        durationInFrames={3060}
        fps={30}
        width={1920}
        height={1080}
      />

      <Folder name="StoryBeats">
        <Composition id="Beat01-Brand" component={Beat01BrandReveal} durationInFrames={165} fps={30} width={1920} height={1080} />
        <Composition id="Beat02-EdahabiaBoom" component={Beat02EdahabiaBoom} durationInFrames={180} fps={30} width={1920} height={1080} />
        <Composition id="Beat03-FakeSms" component={Beat03FakeSmsExample} durationInFrames={195} fps={30} width={1920} height={1080} />
        <Composition id="Beat04-GhostBuyer" component={Beat04GhostBuyer} durationInFrames={180} fps={30} width={1920} height={1080} />
        <Composition id="Beat05-ExposedDb" component={Beat05ExposedDb} durationInFrames={180} fps={30} width={1920} height={1080} />
        <Composition id="Beat06-PersonalSeal" component={Beat06PersonalSeal} durationInFrames={195} fps={30} width={1920} height={1080} />
        <Composition id="Beat07-VerifiedSms" component={Beat07InstantVerifySms} durationInFrames={195} fps={30} width={1920} height={1080} />
        <Composition id="Beat08-Biometric" component={Beat08BiometricSelfie} durationInFrames={195} fps={30} width={1920} height={1080} />
        <Composition id="Beat09-SafeLink" component={Beat09SafeLinkGateway} durationInFrames={195} fps={30} width={1920} height={1080} />
        <Composition id="Beat10-ZeroExposure" component={Beat10EdahabiaZeroExposure} durationInFrames={195} fps={30} width={1920} height={1080} />
        <Composition id="Beat11-OmniChannel" component={Beat11OmniChannel} durationInFrames={210} fps={30} width={1920} height={1080} />
        <Composition id="Beat12-RustEngine" component={Beat12RustNextEngine} durationInFrames={195} fps={30} width={1920} height={1080} />
        <Composition id="Beat13-ZeroizeLaw" component={Beat13ZeroizeAndLaw1807} durationInFrames={195} fps={30} width={1920} height={1080} />
        <Composition id="Beat14-Ecosystem" component={Beat14AlgerianEcosystem} durationInFrames={195} fps={30} width={1920} height={1080} />
        <Composition id="Beat15-KPIs" component={Beat15ImpactGauges} durationInFrames={210} fps={30} width={1920} height={1080} />
        <Composition id="Beat16-Business" component={Beat16BusinessEngines} durationInFrames={195} fps={30} width={1920} height={1080} />
        <Composition id="Beat17-Finale" component={Beat17RoadmapAndFinale} durationInFrames={225} fps={30} width={1920} height={1080} />
      </Folder>
    </>
  );
};
