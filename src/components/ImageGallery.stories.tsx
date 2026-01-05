import type { Meta, StoryObj } from "@storybook/nextjs";
import ImageGallery from "./ImageGallery";
import { fn } from "storybook/test";

const mockImages = [
  "/images/logo_full.jpg",
  "/images/logo_no_hay.jpg",
  "/images/logo_no_texto.jpg",
];

const meta: Meta<typeof ImageGallery> = {
  title: "Components/ImageGallery",
  component: ImageGallery,
  parameters: {
    layout: "fullscreen",
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ["autodocs"],
  argTypes: {
    images: {
      control: "object",
      description: "Array of image URLs",
    },
    productName: {
      control: "text",
      description: "Name of the product for alt text and title",
    },
    onClose: {
      action: "closed",
      description: "Callback function when the gallery is closed",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ImageGallery>;

export const Default: Story = {
  args: {
    images: mockImages,
    productName: "Sample Product",
    onClose: fn(),
  },
};

export const SingleImage: Story = {
  args: {
    images: [mockImages[0]],
    productName: "Single Image Product",
    onClose: fn(),
  },
};

export const NoImages: Story = {
  args: {
    images: [],
    productName: "No Images Product",
    onClose: fn(),
  },
};
