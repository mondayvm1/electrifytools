// Contact form topics. Each one becomes the subject tag on the lead email ("Electrify · Affiliate").
export const TOPICS = [
  {
    id: "affiliate",
    label: "Affiliate",
    title: "Become an affiliate",
    blurb: "Creators, clubs and shops earn on every Dial sold through their link. Tell us where your audience is.",
    extraLabel: "Where's your audience?",
    extraPlaceholder: "YouTube, Instagram, Tesla club, shop…",
  },
  {
    id: "fleet",
    label: "Fleet pricing",
    title: "Fleet & volume pricing",
    blurb: "Running a fleet or multiple bays? Tell us how many vehicles and we'll put a deal together.",
    extraLabel: "How many vehicles?",
    extraPlaceholder: "e.g. 12 Model Ys",
  },
  {
    id: "hiring",
    label: "Hiring",
    title: "Join the team",
    blurb: "EV techs, firmware people, hustlers. Tell us what you know and what you'd build.",
    extraLabel: "What do you do?",
    extraPlaceholder: "EV tech, firmware, sales…",
  },
  {
    id: "general",
    label: "Message",
    title: "Send us a message",
    blurb: "Questions about the Dial, your order, or anything else. We read everything.",
    extraLabel: "Your Tesla",
    extraPlaceholder: "Model 3, 2021 (optional)",
  },
] as const;

export type TopicId = (typeof TOPICS)[number]["id"];
