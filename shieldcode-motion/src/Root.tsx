import React from "react";
import { Composition, Folder } from "remotion";
import { ShieldCodeExecutiveFilm } from "./Composition";
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

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShieldCodeExecutiveFilm"
        component={ShieldCodeExecutiveFilm}
        durationInFrames={3177}
        fps={30}
        width={1920}
        height={1080}
      />

      <Folder name="Slides">
        <Composition id="Slide01-Hero" component={Slide01Hero} durationInFrames={255} fps={30} width={1920} height={1080} />
        <Composition id="Slide02-Problem" component={Slide02Problem} durationInFrames={300} fps={30} width={1920} height={1080} />
        <Composition id="Slide03-FourLayers" component={Slide03FourLayers} durationInFrames={300} fps={30} width={1920} height={1080} />
        <Composition id="Slide04-UserJourney" component={Slide04UserJourney} durationInFrames={285} fps={30} width={1920} height={1080} />
        <Composition id="Slide05-GlassSaaS" component={Slide05GlassSaaS} durationInFrames={285} fps={30} width={1920} height={1080} />
        <Composition id="Slide06-DualArch" component={Slide06DualArch} durationInFrames={285} fps={30} width={1920} height={1080} />
        <Composition id="Slide07-SovereignLaw" component={Slide07SovereignLaw} durationInFrames={285} fps={30} width={1920} height={1080} />
        <Composition id="Slide08-ProductionRoutes" component={Slide08ProductionRoutes} durationInFrames={285} fps={30} width={1920} height={1080} />
        <Composition id="Slide09-UseCases" component={Slide09UseCases} durationInFrames={285} fps={30} width={1920} height={1080} />
        <Composition id="Slide10-KPIs" component={Slide10KPIs} durationInFrames={270} fps={30} width={1920} height={1080} />
        <Composition id="Slide11-BusinessModel" component={Slide11BusinessModel} durationInFrames={270} fps={30} width={1920} height={1080} />
        <Composition id="Slide12-Roadmap" component={Slide12Roadmap} durationInFrames={270} fps={30} width={1920} height={1080} />
      </Folder>
    </>
  );
};
