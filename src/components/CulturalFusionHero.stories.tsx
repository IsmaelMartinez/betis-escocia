import type { Meta, StoryObj } from "@storybook/nextjs";
import CulturalFusionHero from "./CulturalFusionHero";

const meta: Meta<typeof CulturalFusionHero> = {
  title: "Layout/CulturalFusionHero",
  component: CulturalFusionHero,
  parameters: {
    layout: "fullscreen",
    clerk: { enabled: false },
  },
  tags: ["autodocs"],
  argTypes: {
    containerClassName: {
      control: "text",
      description:
        "Additional classes for content container. Common layout classes (mx-auto px-4 sm:px-6 lg:px-8) are included by default.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof CulturalFusionHero>;

export const Default: Story = {
  args: {
    children: (
      <>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
          Página Principal
        </h1>
        <p className="font-accent text-2xl sm:text-3xl text-oro-bright text-shadow-lg italic">
          Bienvenidos a la Peña Bética Escocesa
        </p>
      </>
    ),
  },
};

export const CenteredContent: Story = {
  args: {
    containerClassName: "max-w-4xl text-center",
    children: (
      <>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
          Contacto
        </h1>
        <p className="font-accent text-2xl sm:text-3xl text-oro-bright mb-8 text-shadow-lg italic">
          ¿Tienes alguna pregunta? Estamos aquí para ayudarte
        </p>
      </>
    ),
  },
};

export const SideBySideLayout: Story = {
  args: {
    containerClassName: "max-w-4xl",
    children: (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div className="text-center md:text-left flex-1">
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
            Clasificación
          </h1>
          <p className="font-accent text-2xl sm:text-3xl text-oro-bright text-shadow-lg italic">
            La Liga
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
          <div className="font-heading text-sm text-oro-bright mb-2 uppercase tracking-wide">
            Posición Betis
          </div>
          <div className="font-display text-5xl font-black text-white mb-2">
            8º
          </div>
          <div className="font-body text-lg text-white/90">45 puntos</div>
        </div>
      </div>
    ),
  },
};

export const WideContent: Story = {
  args: {
    containerClassName: "max-w-6xl text-center",
    children: (
      <>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
          ¿Vienes al Polwarth?
        </h1>
        <p className="font-accent text-2xl sm:text-3xl text-oro-bright text-shadow-lg italic">
          Confirma tu asistencia para el próximo partido
        </p>
      </>
    ),
  },
};

export const WithBadge: Story = {
  args: {
    containerClassName: "max-w-4xl text-center",
    children: (
      <>
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
          <span className="text-oro-bright">✉️</span>
          <span className="text-white font-heading font-medium text-sm tracking-wide">
            Ponte en contacto
          </span>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
          Contacto
        </h1>
        <p className="font-accent text-2xl sm:text-3xl text-oro-bright mb-8 text-shadow-lg italic">
          ¿Tienes alguna pregunta? Estamos aquí para ayudarte
        </p>
      </>
    ),
  },
};
