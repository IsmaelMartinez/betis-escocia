import {
  MessageSquare,
  UserPlus,
  Camera,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

export interface ContactFormType {
  id: "general" | "rsvp" | "photo" | "whatsapp" | "feedback";
  nameKey: string;
  descriptionKey: string;
  icon: typeof MessageSquare;
  color: string;
  feature: string | null;
}

export const FORM_TYPES: ContactFormType[] = [
  {
    id: "general",
    nameKey: "formTypeGeneralName",
    descriptionKey: "formTypeGeneralDescription",
    icon: MessageSquare,
    color: "bg-scotland-blue",
    feature: null,
  },
  {
    id: "rsvp",
    nameKey: "formTypeRsvpName",
    descriptionKey: "formTypeRsvpDescription",
    icon: UserPlus,
    color: "bg-betis-verde",
    feature: null,
  },
  {
    id: "photo",
    nameKey: "formTypePhotoName",
    descriptionKey: "formTypePhotoDescription",
    icon: Camera,
    color: "bg-pink-500",
    feature: null,
  },
  {
    id: "whatsapp",
    nameKey: "formTypeWhatsappName",
    descriptionKey: "formTypeWhatsappDescription",
    icon: MessageCircle,
    color: "bg-betis-verde-dark",
    feature: null,
  },
  {
    id: "feedback",
    nameKey: "formTypeFeedbackName",
    descriptionKey: "formTypeFeedbackDescription",
    icon: HelpCircle,
    color: "bg-betis-oro",
    feature: null,
  },
];

export function getDefaultSubjectKey(type: ContactFormType["id"]): string {
  switch (type) {
    case "rsvp":
      return "defaultSubjectRsvp";
    case "photo":
      return "defaultSubjectPhoto";
    case "whatsapp":
      return "defaultSubjectWhatsapp";
    case "feedback":
      return "defaultSubjectFeedback";
    default:
      return "";
  }
}
