import { StoryData } from "../types";

export const MOCK_STORY_DATA: StoryData = {
  metadata: {
    userName: "Aditya Agarwal",
    period: "January 2024 - December 2024",
    currency: "INR",
    totalSpent: 2847000,
    totalEarned: 3200000,
    transactionCount: 3456,
    hideNumbers: false,
  },
  cards: [
    {
      type: "welcome-card",
      layout: "hero",
      title: "Aditya bhai, your dad called",
      data: {
        mainText:
          "₹28,47,000 spent. ₹32,00,000 from papa. The math is concerning.",
        subText: "Jan 2024 - Dec 2024",
      },
      commentary:
        "You spent almost 3 lakhs a month. Papa's credit card is working overtime.",
    },
    {
      type: "biggest-card",
      layout: "stat-grid",
      title: "THE BIGGEST",
      data: {
        stats: [
          {
            label: "Biggest Spend Day",
            value: "₹2,87,000 on March 23rd",
            subtext: "Down payment on Toyota Fortuner. Peak Marwari energy.",
          },
          {
            label: "Biggest Transaction",
            value: "₹1,45,000 at JW Marriott",
            subtext:
              "Weekend trip with the boys. Or showing off. Probably both.",
          },
          {
            label: "Biggest Money In",
            value: "₹5,00,000 from RAJESH AGARWAL",
            subtext: "Papa's quarterly deposit. On time as always.",
          },
          {
            label: "Biggest Money Out",
            value: "₹2,87,000 to TOYOTA FINANCE",
            subtext:
              "Fortuner down payment. Because Creta is for middle class.",
          },
        ],
      },
      commentary:
        "₹2,87,000 on a Fortuner down payment. Bold choice for someone living on papa's money.",
    },
    {
      type: "we-noticed-card",
      layout: "list",
      title: "WE NOTICED",
      data: {
        items: [
          {
            title: "The Ex Files",
            value: "₹1 sent to 7 different girls, 234 times total",
            description:
              "Staying in their notifications. Neha: 67 times, Priya: 45 times, Shruti: 38 times...",
          },
          {
            title: "Hotel Hopper",
            value: "₹6,78,000 on hotels & resorts",
            description:
              "42 hotel bookings. That's 3.5 hotels per month. Where's home?",
          },
          {
            title: "The Club Rat",
            value: "₹4,23,000 at Kitty Su, Toy Room, PCO",
            description: "89 nights out. Liver is sending legal notice.",
          },
        ],
      },
      commentary:
        "Seven exes getting ₹1 notifications. This is not romance, this is psychological warfare.",
    },
    {
      type: "loans-card",
      layout: "list",
      title: "LOANS",
      data: {
        items: [
          {
            title: "KARAN SINGHANIA",
            value: "₹75,000 on June 14",
            description: "Still not returned. Karan is avoiding your calls.",
          },
          {
            title: "ROHAN MALHOTRA",
            value: "₹50,000 on Sept 8",
            description:
              "Birthday party expenses. Rohan says he'll pay. He won't.",
          },
          {
            title: "VIKRAM BHAI",
            value: "₹1,25,000 on Nov 2",
            description:
              "Goa trip sponsorship. The boys will remember. Won't repay though.",
          },
        ],
      },
      commentary:
        "₹2,85,000 lent to friends who think you're an ATM. You kind of are though.",
    },
    {
      type: "alternate-reality-card",
      layout: "list",
      title: "ALTERNATE REALITY",
      data: {
        items: [
          {
            title: "Hotels & Parties",
            value: "₹11,01,000 total",
            description:
              "That's someone's entire annual salary. You spent it on weekends.",
          },
          {
            title: "The Ex Collection",
            value: "₹234 on ₹1 spam to 7 girls",
            description: "Could've just moved on. Therapy is cheaper.",
          },
          {
            title: "Club Cover Charges",
            value: "₹89,000 just on entry",
            description:
              "You paid ₹89,000 just to get inside places. Not even the drinks.",
          },
          {
            title: "What you could've bought",
            value: "A flat deposit, 3 luxury bikes, or peace of mind",
            description: "You chose bottles at Kitty Su instead.",
          },
        ],
      },
      commentary:
        "₹11 lakhs on hotels and partying. Your CA is crying. Your dad doesn't know yet.",
    },
    {
      type: "one-rupee-card",
      layout: "list",
      title: "THE ₹1 SITUATION",
      data: {
        items: [
          {
            title: "NEHA SHARMA",
            value: "67 transactions of ₹1",
            description:
              "She blocked you on WhatsApp. You switched to GPay. Creative.",
          },
          {
            title: "PRIYA KAPOOR",
            value: "45 transactions of ₹1",
            description:
              "Every Sunday night, like clockwork. She hasn't responded since June.",
          },
          {
            title: "SHRUTI MALHOTRA",
            value: "38 transactions of ₹1",
            description:
              "You dated for 2 months. Broke up 8 months ago. Let it go.",
          },
          {
            title: "ANANYA",
            value: "29 transactions of ₹1",
            description:
              "She got married in October. You sent ₹1 on her wedding day. Unhinged.",
          },
          {
            title: "RIYA SINGH",
            value: "23 transactions of ₹1",
            description:
              "She moved to Canada. You're still sending ₹1. International harassment.",
          },
          {
            title: "KAVYA",
            value: "18 transactions of ₹1",
            description: "It's been 2 years. She's moved on. You should too.",
          },
          {
            title: "TANVI GUPTA",
            value: "14 transactions of ₹1",
            description:
              "You never dated. You just wanted to. This is stalking with extra steps.",
          },
        ],
      },
      commentary:
        "234 transactions of ₹1 to seven different women. This is a case study in not moving on.",
    },
  ],
};
