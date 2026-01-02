import type { Meta, StoryObj } from "@storybook/nextjs";
import FeatureCard from "./FeatureCard";
import {
  Users,
  Clock,
  CheckCircle,
  MapPin,
  Calendar,
  Award,
} from "lucide-react";

const meta: Meta<typeof FeatureCard> = {
  title: "UI/FeatureCard",
  component: FeatureCard,
  parameters: {
    layout: "centered",
    clerk: { enabled: false },
  },
  tags: ["autodocs"],
  argTypes: {
    iconBgColor: {
      control: "select",
      options: [
        "bg-betis-verde",
        "bg-betis-verde-dark",
        "bg-betis-oro",
        "bg-scotland-navy",
        "bg-scotland-blue",
      ],
      description: "Background color for the icon circle",
    },
    title: {
      control: "text",
      description: "Feature title",
    },
    description: {
      control: "text",
      description: "Feature description",
    },
  },
};

export default meta;
type Story = StoryObj<typeof FeatureCard>;

export const Default: Story = {
  args: {
    icon: Users,
    title: "Reservamos Mesa",
    description:
      "Con tu confirmación, podemos reservar una mesa grande para que todos estemos juntos viendo el partido.",
  },
};

export const WithClockIcon: Story = {
  args: {
    icon: Clock,
    title: "Llegada Puntual",
    description:
      "Sabemos cuántos venís y podemos avisar si hay que llegar antes para conseguir sitio en partidos importantes.",
  },
};

export const WithCheckIcon: Story = {
  args: {
    icon: CheckCircle,
    title: "Ambiente Bético",
    description:
      "Cuantos más seamos, mejor ambiente. Tu presencia hace que la experiencia sea más especial para todos.",
  },
};

export const DarkGreenBackground: Story = {
  args: {
    icon: MapPin,
    iconBgColor: "bg-betis-verde-dark",
    title: "Ubicación Céntrica",
    description:
      "Polwarth Tavern está en el centro de Edimburgo, fácil acceso en transporte público.",
  },
};

export const GoldBackground: Story = {
  args: {
    icon: Award,
    iconBgColor: "bg-betis-oro",
    title: "Experiencia Única",
    description:
      "Vive el fútbol como nunca antes, rodeado de béticos en Escocia.",
  },
};

export const NavyBackground: Story = {
  args: {
    icon: Calendar,
    iconBgColor: "bg-scotland-navy",
    title: "Todos los Partidos",
    description:
      "Retransmitimos todos los partidos del Real Betis, de todas las competiciones.",
  },
};

export const BlueBackground: Story = {
  args: {
    icon: Users,
    iconBgColor: "bg-scotland-blue",
    title: "Comunidad Activa",
    description:
      "Únete a una comunidad de béticos que viven en Edimburgo y alrededores.",
  },
};

export const ShortDescription: Story = {
  args: {
    icon: CheckCircle,
    title: "¡Únete!",
    description: "Forma parte de nuestra comunidad.",
  },
};

export const LongDescription: Story = {
  args: {
    icon: Users,
    title: "Historia de la Peña",
    description:
      "Desde 2010, la Peña Bética Escocesa ha sido el hogar de los béticos en Edimburgo. Hemos crecido de un pequeño grupo de amigos a una comunidad vibrante de más de 25 miembros activos que se reúnen regularmente en Polwarth Tavern para apoyar al Real Betis Balompié.",
  },
};

export const ThreeCardsLayout: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 max-w-6xl">
      <FeatureCard
        icon={Users}
        title="Reservamos Mesa"
        description="Con tu confirmación, podemos reservar una mesa grande para que todos estemos juntos viendo el partido."
      />
      <FeatureCard
        icon={Clock}
        title="Llegada Puntual"
        description="Sabemos cuántos venís y podemos avisar si hay que llegar antes para conseguir sitio en partidos importantes."
      />
      <FeatureCard
        icon={CheckCircle}
        title="Ambiente Bético"
        description="Cuantos más seamos, mejor ambiente. Tu presencia hace que la experiencia sea más especial para todos."
      />
    </div>
  ),
};
