import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { ChipSelector } from "./chip-selector";

const meta = {
  title: "UI/ChipSelector",
  component: ChipSelector,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    mode: {
      control: "radio",
      options: ["single", "multiple"],
    },
    isDisabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof ChipSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: "10", label: "10%" },
  { value: "15", label: "15%" },
  { value: "20", label: "20%" },
  { value: "25", label: "25%" },
  { value: "custom", label: "Custom" },
];

export const SingleSelect: Story = {
  args: {
    options,
    value: "15",
    onChange: () => {},
    mode: "single",
    isDisabled: false,
  },
  render: function Render() {
    const [value, setValue] = useState<string>("15");
    return (
      <ChipSelector
        options={options}
        value={value}
        onChange={(v) => setValue(v as string)}
        mode="single"
      />
    );
  },
};

export const MultipleSelect: Story = {
  args: {
    options: [
      { value: "vegan", label: "Vegan" },
      { value: "gf", label: "Gluten Free" },
      { value: "spicy", label: "Spicy" },
      { value: "nuts", label: "Contains Nuts" },
    ],
    value: ["vegan"],
    onChange: () => {},
    mode: "multiple",
    isDisabled: false,
    onClear: () => {},
  },
  render: function Render() {
    const [value, setValue] = useState<string[]>(["vegan"]);
    const multiOptions = [
      { value: "vegan", label: "Vegan" },
      { value: "gf", label: "Gluten Free" },
      { value: "spicy", label: "Spicy" },
      { value: "nuts", label: "Contains Nuts" },
    ];
    return (
      <ChipSelector
        options={multiOptions}
        value={value}
        onChange={(v) => setValue(v as string[])}
        mode="multiple"
        onClear={() => setValue([])}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    options,
    value: ["10"],
    onChange: () => {},
    mode: "multiple",
    isDisabled: true,
  },
  render: function Render() {
    return (
      <ChipSelector
        options={options}
        value={["10"]}
        onChange={() => {}}
        mode="multiple"
        isDisabled={true}
      />
    );
  },
};
