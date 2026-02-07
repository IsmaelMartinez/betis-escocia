import {
  MessageSquare,
  UserPlus,
  Camera,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

export interface ContactFormType {
  id: "general" | "rsvp" | "photo" | "whatsapp" | "feedback";
  name: string;
  description: string;
  icon: typeof MessageSquare;
  color: string;
  feature: string | null;
}

export const FORM_TYPES: ContactFormType[] = [
  {
    id: "general",
    name: "Consulta General",
    description: "Preguntas generales sobre la peña",
    icon: MessageSquare,
    color: "bg-scotland-blue",
    feature: null,
  },
  {
    id: "rsvp",
    name: "Eventos y RSVP",
    description: "Dudas sobre eventos y confirmaciones",
    icon: UserPlus,
    color: "bg-betis-verde",
    feature: null,
  },
  {
    id: "photo",
    name: "Fotos y Galería",
    description: "Envío de fotos o problemas con la galería",
    icon: Camera,
    color: "bg-pink-500",
    feature: null,
  },
  {
    id: "whatsapp",
    name: "Unirse a WhatsApp",
    description: "Solicitar invitación al grupo de WhatsApp",
    icon: MessageCircle,
    color: "bg-betis-verde-dark",
    feature: null,
  },
  {
    id: "feedback",
    name: "Sugerencias Web",
    description: "Mejoras y feedback sobre la web",
    icon: HelpCircle,
    color: "bg-betis-oro",
    feature: null,
  },
];

export function getDefaultSubject(type: ContactFormType["id"]): string {
  switch (type) {
    case "rsvp":
      return "Consulta sobre eventos";
    case "photo":
      return "Envío de fotos";
    case "whatsapp":
      return "Solicitud de invitación a WhatsApp";
    case "feedback":
      return "Sugerencias para la web";
    default:
      return "";
  }
}
