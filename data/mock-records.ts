export type BaziRecord = {
  id: string;
  name: string;
  gender: "男" | "女";
  birthDate: string;
  birthTime: string;
  inputMode?: "solar" | "lunar" | "pillars" | "date" | "ganzhi";
  pillars?: {
    year: string;
    month: string;
    day: string;
    time: string;
  };
  referenceSolarDateTime?: string;
  notes: string;
  createdAt: string;
};

export const mockRecords: BaziRecord[] = [
  {
    id: "1",
    name: "张三",
    gender: "男",
    birthDate: "1992-06-15",
    birthTime: "08:30",
    notes: "用于事业与财运分析",
    createdAt: "2026-04-13"
  },
  {
    id: "2",
    name: "李四",
    gender: "女",
    birthDate: "1996-11-02",
    birthTime: "21:15",
    notes: "关注婚姻与健康趋势",
    createdAt: "2026-04-13"
  }
];
