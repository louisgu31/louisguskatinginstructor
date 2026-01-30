import { AppContent } from './types.ts';

export const INITIAL_CONTENT: AppContent = {
  heroImage: "https://images.unsplash.com/photo-1563854125867-0c7585098959?q=80&w=2000&auto=format&fit=crop",
  galleryImages: [
    "https://images.unsplash.com/photo-1515703407324-5f7536622107?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486895358764-a63319808d6d?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1552674605-46f5b9029962?q=80&w=1000&auto=format&fit=crop"
  ],
  hero: {
    title: {
      en: "Louis Gu",
      cn: "Louis Gu"
    },
    subtitle: {
      en: "Elite Skating Instructor | Toronto DT",
      cn: "多伦多DT滑冰 / 专业冰球私教"
    },
    cta: {
      en: "Book a Session",
      cn: "预约课程"
    }
  },
  about: {
    title: {
      en: "About Me",
      cn: "个人背景"
    },
    intro: {
      en: "From a professional goalie to a dedicated skating instructor. I bring championship-level discipline to every lesson.",
      cn: "从职业守门员到专业滑冰教练。我将冠军级别的纪律带入每一堂课。"
    },
    timeline: [
      {
        year: "Age 7",
        title: { en: "Started Skating", cn: "开始接触滑冰" },
        description: { en: "First steps on the ice.", cn: "开启冰上之旅" }
      },
      {
        year: "Age 8",
        title: { en: "Hockey Training", cn: "系统训练冰球" },
        description: { en: "Began systematic ice hockey training.", cn: "开始接受正规冰球训练" }
      },
      {
        year: "Age 12",
        title: { en: "Moved to Canada", cn: "来到加拿大发展" },
        description: { en: "Immersed in the North American hockey system.", cn: "接受北美体系训练" }
      },
      {
        year: "2024",
        title: { en: "CSSHL U18 AAA Champion", cn: "CSSHL U18 AAA 联赛冠军" },
        description: { en: "Won the championship with the team.", cn: "随队拿下联赛冠军" }
      }
    ]
  },
  services: {
    title: {
      en: "Training Programs",
      cn: "私教内容"
    },
    items: [
      {
        icon: "fa-person-skating",
        title: { en: "Skating Foundations", cn: "滑冰基础" },
        description: { en: "For beginners to advanced. Learn the correct edges and balance.", cn: "初学者 / 进阶滑冰基础。" }
      },
      {
        icon: "fa-hockey-puck",
        title: { en: "Hockey Skills", cn: "冰球滑行与意识" },
        description: { en: "Technical movement, game awareness, and power skating.", cn: "冰球滑行、技术动作、比赛意识。" }
      },
      {
        icon: "fa-child-reaching",
        title: { en: "Youth Coaching", cn: "儿童 / 青少年教学" },
        description: { en: "Patient, detailed, and communicative teaching style.", cn: "耐心细致、好沟通。" }
      },
      {
        icon: "fa-shield-halved",
        title: { en: "Goalie Specifics", cn: "守门员专项" },
        description: { en: "From basics to advanced techniques (positioning/stance).", cn: "守门员专项训练（基础到提高）。" }
      }
    ]
  },
  awards: {
    title: {
      en: "Awards & Experience",
      cn: "相关经历与奖项"
    },
    items: [
      { en: "Thailand International Queen's Cup - 2nd Place & Best Goalie", cn: "泰国国际女王杯（国际赛第二名/最佳守门员奖）" },
      { en: "China National Championship U18 - MVP", cn: "中国全国锦标赛 U18 （MVP 最佳球员奖）" },
      { en: "Represented Canada in 30+ International Leagues", cn: "代表加拿大参加过30+国际联赛" },
      { en: "Assistant Coach at Shanghai Feiyang Ice Center", cn: "上海飞扬冰上中心 担任副教练教小学员" }
    ]
  },
  testimonials: {
    title: {
      en: "Video Testimonials",
      cn: "学员视频反馈"
    },
    items: [
      {
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ"
      },
      {
        url: "https://www.youtube.com/embed/ScMzIvxBSi4"
      }
    ]
  },
  contact: {
    title: {
      en: "Get In Touch",
      cn: "联系方式"
    },
    desc: {
      en: "Looking for a skating or hockey coach? Message me for details.",
      cn: "如果你或身边的朋友正在找滑冰 / 冰球教练，欢迎私信我了解详情。"
    },
    email: "louisgu31@gmail.com",
    phone: "250-899-4781",
    location: {
      en: "Toronto Downtown / U of T Area",
      cn: "多伦多 DT / 多伦多大学"
    }
  }
};