"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FeedbackCreateInput, FeedbackCategory, FeedbackPriority } from "@/types/feedback";

interface FeedbackFormProps {
  onSubmit: (data: FeedbackCreateInput) => Promise<void>;
  isSubmitting?: boolean;
}

const categories: FeedbackCategory[] = ["service", "food_quality", "ambiance", "pricing", "staff", "general"];
const priorities: FeedbackPriority[] = ["low", "medium", "high", "urgent"];

export default function FeedbackForm({ onSubmit, isSubmitting }: FeedbackFormProps) {
  const [category, setCategory] = useState<FeedbackCategory>("service");
  const [priority, setPriority] = useState<FeedbackPriority>("medium");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleSubmit = async () => {
    const attachmentNames = attachments.map((file) => file.name).join(", ");
    await onSubmit({
      category,
      priority,
      subject,
      message,
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined,
      attachments: attachmentNames || undefined,
      isAnonymous,
    });
    setSubject("");
    setMessage("");
    setAttachments([]);
    setContactEmail("");
    setContactPhone("");
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Submit feedback</h3>
        <p className="text-sm text-gray-500">Share concerns, ideas, or compliments.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={(value) => setCategory(value as FeedbackCategory)}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(value) => setPriority(value as FeedbackPriority)}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
        />
        <div className="text-xs text-gray-500">{message.length} / 2000</div>
        <p className="text-xs text-gray-400">Tip: add dates, staff names, or order numbers for quicker help.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact email (optional)</Label>
          <Input id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPhone">Contact phone (optional)</Label>
          <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="attachments">Attachments (file names only)</Label>
        <Input
          id="attachments"
          type="file"
          multiple
          onChange={(event) => setAttachments(Array.from(event.target.files || []))}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(event) => setIsAnonymous(event.target.checked)}
        />
        Submit anonymously
      </label>

      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit feedback"}
      </Button>
    </div>
  );
}
