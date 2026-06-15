import type {
  Event,
  Category,
  RoutePoint,
  Volunteer,
  Participant,
  BibNumber,
  PickupRecord,
  TimeRecord,
  Result,
  Award,
  Winner,
  Prize,
  PrizeDistribution,
  SurveyResponse,
} from "../types";

let idCounter = 1;
const generateId = (prefix: string) => `${prefix}_${String(idCounter++).padStart(4, "0")}`;

const chineseMaleNames = [
  "张伟", "王强", "李军", "刘洋", "陈勇", "杨光", "赵磊", "黄杰", "周鹏", "吴涛",
  "徐明", "孙浩", "马超", "朱峰", "胡斌", "郭刚", "何林", "高飞", "林峰", "郑宇",
  "罗超", "梁博", "宋阳", "谢威", "唐毅", "许航", "韩冰", "冯凯", "邓辉", "曹磊",
];

const chineseFemaleNames = [
  "王芳", "李娜", "张丽", "刘洋", "陈静", "杨丽", "赵敏", "黄婷", "周雪", "吴燕",
  "徐霞", "孙梅", "朱丽", "胡玲", "郭燕", "何晶", "高颖", "林琳", "郑丽", "罗薇",
  "梁爽", "宋佳", "谢蕾", "唐瑶", "许晴",
];

const phoneSuffixes = [
  "138", "139", "158", "159", "186", "187", "188", "189", "136", "137",
  "150", "151", "152", "156", "157", "176", "177", "178", "135", "185",
];

const generatePhone = (seed: number) => {
  const prefix = phoneSuffixes[seed % phoneSuffixes.length];
  const num = 10000000 + (seed * 7919) % 89999999;
  return `${prefix}${String(num).slice(-8)}`;
};

const volunteerRoles = [
  { role: "起终点管理", area: "起点/终点" },
  { role: "起终点管理", area: "起点/终点" },
  { role: "补给站", area: "25km补给站" },
  { role: "补给站", area: "55km补给站" },
  { role: "补给站", area: "90km补给站" },
  { role: "医疗", area: "25km医疗点" },
  { role: "医疗", area: "55km医疗点" },
  { role: "医疗", area: "终点医疗站" },
  { role: "计时", area: "起点计时" },
  { role: "计时", area: "终点计时" },
  { role: "引导", area: "赛道引导" },
  { role: "引导", area: "赛道引导" },
  { role: "引导", area: "转折点引导" },
  { role: "安全保障", area: "巡逻车" },
  { role: "后勤", area: "物资管理" },
];

const volunteerNames = [
  "王建国", "李秀兰", "张志明", "刘春华", "陈志强", "杨美玲", "赵文博", "黄晓东",
  "周丽华", "吴大伟", "徐小燕", "孙立军", "马静怡", "朱天翔", "胡慧敏",
];

export function generateEvent(): Event {
  return {
    id: "evt_0001",
    name: "2026环太湖自行车挑战赛",
    date: "2026-10-18",
    location: "无锡",
    distance_km: 120,
    description: "2026环太湖自行车挑战赛是华东地区最具影响力的公路自行车赛事之一，赛道环绕美丽的太湖，风景如画，挑战与享受并存。",
    status: "ongoing",
    elevation: 800,
    max_participants: 500,
  };
}

export function generateCategories(eventId: string): Category[] {
  return [
    {
      id: "cat_0001",
      event_id: eventId,
      name: "男子精英组",
      gender: "male",
      age_min: 18,
      age_max: 40,
      fee: 288,
      bib_prefix: "ME",
      bib_start: 101,
      distance_km: 120,
    },
    {
      id: "cat_0002",
      event_id: eventId,
      name: "男子公开组",
      gender: "male",
      age_min: 18,
      age_max: 60,
      fee: 188,
      bib_prefix: "MO",
      bib_start: 201,
      distance_km: 120,
    },
    {
      id: "cat_0003",
      event_id: eventId,
      name: "女子组",
      gender: "female",
      age_min: 18,
      age_max: 55,
      fee: 188,
      bib_prefix: "WE",
      bib_start: 301,
      distance_km: 80,
    },
    {
      id: "cat_0004",
      event_id: eventId,
      name: "体验组",
      gender: "mixed",
      age_min: 16,
      age_max: 65,
      fee: 88,
      bib_prefix: "EX",
      bib_start: 401,
      distance_km: 40,
    },
  ];
}

export function generateRoutePoints(eventId: string): RoutePoint[] {
  return [
    {
      id: "rp_0001",
      event_id: eventId,
      type: "start",
      name: "无锡大剧院广场起点",
      position_x: 0,
      position_y: 0,
      distance_km: 0,
    },
    {
      id: "rp_0002",
      event_id: eventId,
      type: "aid",
      name: "25km补给站（马山）",
      position_x: 200,
      position_y: 120,
      cut_off_time: "2026-10-18 09:30:00",
      distance_km: 25,
    },
    {
      id: "rp_0003",
      event_id: eventId,
      type: "aid",
      name: "55km补给站（闾江口）",
      position_x: 420,
      position_y: 280,
      cut_off_time: "2026-10-18 11:00:00",
      distance_km: 55,
    },
    {
      id: "rp_0004",
      event_id: eventId,
      type: "cutoff",
      name: "60km关门点",
      position_x: 460,
      position_y: 310,
      cut_off_time: "2026-10-18 11:30:00",
      distance_km: 60,
    },
    {
      id: "rp_0005",
      event_id: eventId,
      type: "cutoff",
      name: "85km关门点",
      position_x: 640,
      position_y: 420,
      cut_off_time: "2026-10-18 13:30:00",
      distance_km: 85,
    },
    {
      id: "rp_0006",
      event_id: eventId,
      type: "aid",
      name: "90km补给站（军嶂山）",
      position_x: 680,
      position_y: 450,
      cut_off_time: "2026-10-18 14:00:00",
      distance_km: 90,
    },
    {
      id: "rp_0007",
      event_id: eventId,
      type: "finish",
      name: "无锡大剧院广场终点",
      position_x: 900,
      position_y: 0,
      cut_off_time: "2026-10-18 16:00:00",
      distance_km: 120,
    },
  ];
}

export function generateVolunteers(eventId: string): Volunteer[] {
  return volunteerNames.map((name, i) => ({
    id: generateId("vol"),
    event_id: eventId,
    name,
    phone: generatePhone(i + 500),
    email: `volunteer${i + 1}@thbike.com`,
    role: volunteerRoles[i].role,
    area: volunteerRoles[i].area,
    status: i < 12 ? "arrived" : "confirmed",
    assigned_at: "2026-10-15 09:00:00",
  }));
}

function generateBirthDate(ageMin: number, ageMax: number, seed: number): string {
  const age = ageMin + (seed % (ageMax - ageMin + 1));
  const year = 2026 - age;
  const month = 1 + (seed * 7) % 12;
  const day = 1 + (seed * 13) % 28;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function generateRegisteredAt(seed: number): string {
  const daysBefore = 30 + (seed * 3) % 45;
  const base = new Date("2026-10-18");
  base.setDate(base.getDate() - daysBefore);
  const hour = 9 + (seed * 5) % 10;
  const minute = (seed * 17) % 60;
  return `${base.toISOString().split("T")[0]} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

export function generateParticipants(eventId: string, categories: Category[]): Participant[] {
  const participants: Participant[] = [];
  let seed = 1;

  const [eliteCat, openCat, femaleCat, expCat] = categories;

  for (let i = 0; i < 15; i++) {
    const name = chineseMaleNames[i % chineseMaleNames.length];
    participants.push({
      id: generateId("p"),
      event_id: eventId,
      category_id: eliteCat.id,
      name,
      gender: "male",
      birth_date: generateBirthDate(eliteCat.age_min, eliteCat.age_max, seed),
      phone: generatePhone(seed),
      email: `rider${seed}@bike.com`,
      emergency_contact: chineseMaleNames[(seed + 5) % chineseMaleNames.length],
      emergency_phone: generatePhone(seed + 1000),
      health_declaration: true,
      registered_at: generateRegisteredAt(seed),
      team: i < 5 ? ["闪电车队", "崔克中国", "捷安特联队", "美利达挑战者", "无锡骑行俱乐部"][i] : undefined,
    });
    seed++;
  }

  for (let i = 0; i < 25; i++) {
    const name = chineseMaleNames[(i + 10) % chineseMaleNames.length];
    participants.push({
      id: generateId("p"),
      event_id: eventId,
      category_id: openCat.id,
      name,
      gender: "male",
      birth_date: generateBirthDate(openCat.age_min, openCat.age_max, seed),
      phone: generatePhone(seed),
      email: `rider${seed}@bike.com`,
      emergency_contact: chineseFemaleNames[(seed + 3) % chineseFemaleNames.length],
      emergency_phone: generatePhone(seed + 2000),
      health_declaration: true,
      registered_at: generateRegisteredAt(seed),
      team: i % 7 === 0 ? ["苏州单车联盟", "南京骑友会", "杭州骑行圈", "上海骑迹"][i % 4] : undefined,
    });
    seed++;
  }

  for (let i = 0; i < 12; i++) {
    const name = chineseFemaleNames[i % chineseFemaleNames.length];
    participants.push({
      id: generateId("p"),
      event_id: eventId,
      category_id: femaleCat.id,
      name,
      gender: "female",
      birth_date: generateBirthDate(femaleCat.age_min, femaleCat.age_max, seed),
      phone: generatePhone(seed),
      email: `rider${seed}@bike.com`,
      emergency_contact: chineseMaleNames[(seed + 7) % chineseMaleNames.length],
      emergency_phone: generatePhone(seed + 3000),
      health_declaration: true,
      registered_at: generateRegisteredAt(seed),
      team: i < 3 ? ["女子闪电队", "丽以芙女子车队", "无锡玫瑰骑行团"][i] : undefined,
    });
    seed++;
  }

  for (let i = 0; i < 8; i++) {
    const isMale = i % 2 === 0;
    const name = isMale
      ? chineseMaleNames[(i + 20) % chineseMaleNames.length]
      : chineseFemaleNames[(i + 12) % chineseFemaleNames.length];
    participants.push({
      id: generateId("p"),
      event_id: eventId,
      category_id: expCat.id,
      name,
      gender: isMale ? "male" : "female",
      birth_date: generateBirthDate(expCat.age_min, expCat.age_max, seed),
      phone: generatePhone(seed),
      email: `rider${seed}@bike.com`,
      emergency_contact: isMale
        ? chineseFemaleNames[(seed + 2) % chineseFemaleNames.length]
        : chineseMaleNames[(seed + 4) % chineseMaleNames.length],
      emergency_phone: generatePhone(seed + 4000),
      health_declaration: true,
      registered_at: generateRegisteredAt(seed),
    });
    seed++;
  }

  return participants;
}

export function generateBibNumbers(participants: Participant[], categories: Category[]): BibNumber[] {
  const bibNumbers: BibNumber[] = [];
  const categoryCounters: Record<string, number> = {};

  categories.forEach((cat) => {
    categoryCounters[cat.id] = cat.bib_start;
  });

  participants.forEach((p) => {
    const cat = categories.find((c) => c.id === p.category_id)!;
    bibNumbers.push({
      id: generateId("bib"),
      participant_id: p.id,
      category_id: p.category_id,
      number: categoryCounters[p.category_id]++,
      prefix: cat.bib_prefix,
    });
  });

  return bibNumbers;
}

function formatTime(d: Date): string {
  return d.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
}

export function generatePickupRecords(participants: Participant[]): PickupRecord[] {
  return participants.map((p, i) => {
    const picked = i < Math.floor(participants.length * 0.85);
    if (!picked) {
      return {
        id: generateId("pk"),
        participant_id: p.id,
        picked: false,
      };
    }
    const pickupDate = new Date("2026-10-16T10:00:00");
    pickupDate.setHours(10 + (i * 2) % 8);
    pickupDate.setMinutes((i * 13) % 60);
    return {
      id: generateId("pk"),
      participant_id: p.id,
      picked: true,
      picked_at: formatTime(pickupDate),
      operator: ["李秀兰", "张志明", "刘春华"][i % 3],
      items: ["参赛包", "号码布", "计时芯片", "赛事手册"],
    };
  });
}

function getCategoryDistance(categories: Category[], categoryId: string): number {
  return categories.find((c) => c.id === categoryId)?.distance_km ?? 120;
}

export function generateTimeRecords(
  participants: Participant[],
  categories: Category[],
  routePoints: RoutePoint[]
): TimeRecord[] {
  const timeRecords: TimeRecord[] = [];

  participants.forEach((p, i) => {
    const cat = categories.find((c) => c.id === p.category_id)!;
    const distance = cat.distance_km;

    let dns = false;
    let dnf = false;

    if (i % 60 === 3) dns = true;
    else if (i % 60 === 17 || i % 60 === 41) dnf = true;

    if (dns) {
      timeRecords.push({
        id: generateId("tr"),
        participant_id: p.id,
        source: "chip",
        dns: true,
      });
      return;
    }

    const eventDate = "2026-10-18";
    const startHour = cat.id === "cat_0001" ? 7 : cat.id === "cat_0002" ? 7 : cat.id === "cat_0003" ? 7 : 7;
    const startMinute = cat.id === "cat_0001" ? 30 : cat.id === "cat_0002" ? 35 : cat.id === "cat_0003" ? 40 : 50;

    const startTime = new Date(`${eventDate}T${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}:00`);
    startTime.setMinutes(startTime.getMinutes() + (i % 5));

    let speedKmh: number;
    if (cat.id === "cat_0001") {
      speedKmh = 36 + (i % 8) * 0.8;
    } else if (cat.id === "cat_0002") {
      speedKmh = 28 + (i % 12) * 0.6;
    } else if (cat.id === "cat_0003") {
      speedKmh = 26 + (i % 6) * 0.7;
    } else {
      speedKmh = 20 + (i % 5) * 0.8;
    }

    const totalSeconds = Math.floor((distance / speedKmh) * 3600);

    if (dnf) {
      const dnfPoint = routePoints.find((rp) => rp.type === "cutoff" && rp.distance_km! <= distance * 0.6);
      const splitTimes: { point_id: string; time: string }[] = [];

      routePoints.forEach((rp) => {
        if (rp.distance_km === undefined) return;
        if (dnfPoint && rp.distance_km > dnfPoint.distance_km!) return;
        if (rp.distance_km > distance) return;
        if (rp.type === "finish") return;

        const rpRatio = rp.distance_km / distance;
        const rpSeconds = Math.floor(totalSeconds * rpRatio);
        const rpTime = new Date(startTime.getTime() + rpSeconds * 1000);
        splitTimes.push({
          point_id: rp.id,
          time: formatTime(rpTime),
        });
      });

      timeRecords.push({
        id: generateId("tr"),
        participant_id: p.id,
        start_time: formatTime(startTime),
        split_times: splitTimes,
        source: "chip",
        dnf: true,
      });
      return;
    }

    const finishTime = new Date(startTime.getTime() + totalSeconds * 1000);

    const splitTimes: { point_id: string; time: string }[] = [];
    routePoints.forEach((rp) => {
      if (rp.distance_km === undefined) return;
      if (rp.distance_km === 0 || rp.distance_km > distance) return;
      if (rp.type === "finish") return;

      const rpRatio = rp.distance_km / 120;
      const rpSeconds = Math.floor(totalSeconds * rpRatio * (120 / distance));
      const rpTime = new Date(startTime.getTime() + rpSeconds * 1000);
      splitTimes.push({
        point_id: rp.id,
        time: formatTime(rpTime),
      });
    });

    timeRecords.push({
      id: generateId("tr"),
      participant_id: p.id,
      start_time: formatTime(startTime),
      finish_time: formatTime(finishTime),
      split_times: splitTimes,
      source: "chip",
    });
  });

  return timeRecords;
}

export function generateResults(
  participants: Participant[],
  categories: Category[],
  timeRecords: TimeRecord[]
): Result[] {
  const results: Result[] = [];

  const finishedByCat: Record<string, { pid: string; time: number }[]> = {};
  categories.forEach((c) => (finishedByCat[c.id] = []));
  const allFinished: { pid: string; time: number }[] = [];

  timeRecords.forEach((tr) => {
    if (tr.dns || tr.dnf || !tr.start_time || !tr.finish_time) return;
    const p = participants.find((pp) => pp.id === tr.participant_id)!;
    const start = new Date(tr.start_time).getTime();
    const finish = new Date(tr.finish_time).getTime();
    const gunTime = Math.floor((finish - start) / 1000);
    finishedByCat[p.category_id].push({ pid: p.id, time: gunTime });
    allFinished.push({ pid: p.id, time: gunTime });
  });

  Object.keys(finishedByCat).forEach((cid) => {
    finishedByCat[cid].sort((a, b) => a.time - b.time);
  });
  allFinished.sort((a, b) => a.time - b.time);

  participants.forEach((p) => {
    const tr = timeRecords.find((t) => t.participant_id === p.id)!;
    const cat = categories.find((c) => c.id === p.category_id)!;
    const distance = cat.distance_km;

    let status: Result["status"] = "pending";
    let gunTime = 0;
    let netTime = 0;
    let avgSpeed = 0;
    let pace = 0;
    let overallRank = 0;
    let catRank = 0;

    if (tr.dns) {
      status = "dns";
    } else if (tr.dnf) {
      status = "dnf";
    } else if (tr.start_time && tr.finish_time) {
      status = "finished";
      const start = new Date(tr.start_time).getTime();
      const finish = new Date(tr.finish_time).getTime();
      gunTime = Math.floor((finish - start) / 1000);
      netTime = gunTime - Math.floor(Math.random() * 10);
      avgSpeed = Number(((distance / gunTime) * 3600).toFixed(2));
      pace = Number(((gunTime / 60) / distance).toFixed(2));

      overallRank = allFinished.findIndex((x) => x.pid === p.id) + 1;
      catRank = finishedByCat[p.category_id].findIndex((x) => x.pid === p.id) + 1;
    }

    results.push({
      id: generateId("res"),
      participant_id: p.id,
      category_id: p.category_id,
      gun_time_seconds: gunTime,
      net_time_seconds: netTime,
      avg_speed: avgSpeed,
      overall_rank: overallRank,
      category_rank: catRank,
      status,
      pace_min_per_km: pace,
    });
  });

  return results;
}

export function generateAwards(eventId: string, categories: Category[]): Award[] {
  return [
    {
      id: "awd_0001",
      event_id: eventId,
      category_id: categories[0].id,
      name: "男子精英组冠军",
      type: "category",
      rank_from: 1,
      rank_to: 1,
      description: "男子精英组第一名",
    },
    {
      id: "awd_0002",
      event_id: eventId,
      category_id: categories[0].id,
      name: "男子精英组亚军",
      type: "category",
      rank_from: 2,
      rank_to: 2,
      description: "男子精英组第二名",
    },
    {
      id: "awd_0003",
      event_id: eventId,
      category_id: categories[0].id,
      name: "男子精英组季军",
      type: "category",
      rank_from: 3,
      rank_to: 3,
      description: "男子精英组第三名",
    },
    {
      id: "awd_0004",
      event_id: eventId,
      category_id: categories[1].id,
      name: "男子公开组冠军",
      type: "category",
      rank_from: 1,
      rank_to: 1,
      description: "男子公开组第一名",
    },
    {
      id: "awd_0005",
      event_id: eventId,
      category_id: categories[1].id,
      name: "男子公开组亚军",
      type: "category",
      rank_from: 2,
      rank_to: 2,
      description: "男子公开组第二名",
    },
    {
      id: "awd_0006",
      event_id: eventId,
      category_id: categories[1].id,
      name: "男子公开组季军",
      type: "category",
      rank_from: 3,
      rank_to: 3,
      description: "男子公开组第三名",
    },
    {
      id: "awd_0007",
      event_id: eventId,
      category_id: categories[2].id,
      name: "女子组冠军",
      type: "category",
      rank_from: 1,
      rank_to: 1,
      description: "女子组第一名",
    },
    {
      id: "awd_0008",
      event_id: eventId,
      category_id: categories[2].id,
      name: "女子组亚军",
      type: "category",
      rank_from: 2,
      rank_to: 2,
      description: "女子组第二名",
    },
    {
      id: "awd_0009",
      event_id: eventId,
      category_id: categories[2].id,
      name: "女子组季军",
      type: "category",
      rank_from: 3,
      rank_to: 3,
      description: "女子组第三名",
    },
    {
      id: "awd_0010",
      event_id: eventId,
      category_id: categories[3].id,
      name: "体验组冠军",
      type: "category",
      rank_from: 1,
      rank_to: 1,
      description: "体验组第一名",
    },
    {
      id: "awd_0011",
      event_id: eventId,
      category_id: categories[3].id,
      name: "体验组亚军",
      type: "category",
      rank_from: 2,
      rank_to: 2,
      description: "体验组第二名",
    },
    {
      id: "awd_0012",
      event_id: eventId,
      category_id: categories[3].id,
      name: "体验组季军",
      type: "category",
      rank_from: 3,
      rank_to: 3,
      description: "体验组第三名",
    },
    {
      id: "awd_0013",
      event_id: eventId,
      name: "总成绩冠军",
      type: "overall",
      rank_from: 1,
      rank_to: 1,
      description: "全场总成绩第一名",
    },
    {
      id: "awd_0014",
      event_id: eventId,
      name: "总成绩亚军",
      type: "overall",
      rank_from: 2,
      rank_to: 2,
      description: "全场总成绩第二名",
    },
    {
      id: "awd_0015",
      event_id: eventId,
      name: "总成绩季军",
      type: "overall",
      rank_from: 3,
      rank_to: 3,
      description: "全场总成绩第三名",
    },
    {
      id: "awd_0016",
      event_id: eventId,
      name: "最佳拼搏奖",
      type: "special",
      rank_from: 1,
      rank_to: 1,
      description: "表彰在比赛中展现出顽强拼搏精神的选手",
    },
    {
      id: "awd_0017",
      event_id: eventId,
      name: "最佳风尚奖",
      type: "special",
      rank_from: 1,
      rank_to: 1,
      description: "表彰在比赛中展现出良好体育道德风尚的选手",
    },
    {
      id: "awd_0018",
      event_id: eventId,
      name: "最年轻完赛者",
      type: "special",
      rank_from: 1,
      rank_to: 1,
      description: "本次赛事年龄最小的完赛选手",
    },
    {
      id: "awd_0019",
      event_id: eventId,
      name: "最年长老将",
      type: "special",
      rank_from: 1,
      rank_to: 1,
      description: "本次赛事年龄最大的完赛选手",
    },
  ];
}

export function generateWinners(
  awards: Award[],
  participants: Participant[],
  results: Result[]
): Winner[] {
  const winners: Winner[] = [];

  awards.forEach((award) => {
    let winnerIds: string[] = [];

    if (award.type === "category" && award.category_id) {
      const catResults = results
        .filter((r) => r.category_id === award.category_id && r.status === "finished")
        .sort((a, b) => a.category_rank - b.category_rank);
      for (let rank = award.rank_from; rank <= award.rank_to; rank++) {
        const res = catResults.find((r) => r.category_rank === rank);
        if (res) winnerIds.push(res.participant_id);
      }
    } else if (award.type === "overall") {
      const allResults = results
        .filter((r) => r.status === "finished")
        .sort((a, b) => a.overall_rank - b.overall_rank);
      for (let rank = award.rank_from; rank <= award.rank_to; rank++) {
        const res = allResults.find((r) => r.overall_rank === rank);
        if (res) winnerIds.push(res.participant_id);
      }
    } else if (award.type === "special") {
      const finished = participants.filter((p) => {
        const r = results.find((rr) => rr.participant_id === p.id);
        return r?.status === "finished";
      });

      if (award.name === "最年轻完赛者") {
        const youngest = [...finished].sort(
          (a, b) => new Date(b.birth_date).getTime() - new Date(a.birth_date).getTime()
        )[0];
        if (youngest) winnerIds.push(youngest.id);
      } else if (award.name === "最年长老将") {
        const oldest = [...finished].sort(
          (a, b) => new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime()
        )[0];
        if (oldest) winnerIds.push(oldest.id);
      } else if (award.name === "最佳拼搏奖") {
        const dnfThenFinished = [...finished].sort((a, b) => {
          const ra = results.find((rr) => rr.participant_id === a.id)!;
          const rb = results.find((rr) => rr.participant_id === b.id)!;
          return rb.gun_time_seconds - ra.gun_time_seconds;
        });
        const pick = dnfThenFinished[Math.floor(dnfThenFinished.length * 0.85)];
        if (pick) winnerIds.push(pick.id);
      } else if (award.name === "最佳风尚奖") {
        const pick = finished.find((p) => p.team !== undefined);
        if (pick) winnerIds.push(pick.id);
      }
    }

    winnerIds.forEach((pid, idx) => {
      winners.push({
        id: generateId("win"),
        award_id: award.id,
        participant_id: pid,
        presented: true,
        presented_at: `2026-10-18 17:${String(10 + idx * 3).padStart(2, "0")}:00`,
        presenter: ["赛事总监", "无锡市体育局领导", "冠名赞助商代表"][idx % 3],
      });
    });
  });

  return winners;
}

export function generatePrizes(eventId: string): Prize[] {
  return [
    {
      id: "prz_0001",
      event_id: eventId,
      name: "冠军奖杯",
      description: "精美水晶奖杯，刻有赛事名称和奖项",
      total_quantity: 19,
      distributed: 19,
      value: 800,
    },
    {
      id: "prz_0002",
      event_id: eventId,
      name: "完赛奖牌",
      description: "2026环太湖自行车挑战赛完赛纪念奖牌",
      total_quantity: 500,
      distributed: 54,
      value: 120,
    },
    {
      id: "prz_0003",
      event_id: eventId,
      name: "定制骑行服",
      description: "赛事专属定制骑行服，速干透气面料",
      total_quantity: 20,
      distributed: 12,
      value: 680,
    },
    {
      id: "prz_0004",
      event_id: eventId,
      name: "专业骑行头盔",
      description: "Giro品牌空气动力学骑行头盔",
      total_quantity: 10,
      distributed: 7,
      value: 1280,
    },
    {
      id: "prz_0005",
      event_id: eventId,
      name: "骑行袜套装",
      description: "抗菌透气专业骑行袜（3双装）",
      total_quantity: 100,
      distributed: 19,
      value: 98,
    },
    {
      id: "prz_0006",
      event_id: eventId,
      name: "荣誉证书",
      description: "精美装帧获奖荣誉证书",
      total_quantity: 50,
      distributed: 19,
      value: 50,
    },
  ];
}

export function generatePrizeDistributions(
  winners: Winner[],
  prizes: Prize[],
  participants: Participant[],
  results: Result[]
): PrizeDistribution[] {
  const distributions: PrizeDistribution[] = [];
  const opers = ["刘春华", "陈志强", "杨美玲", "赵文博"];

  winners.forEach((w, i) => {
    const awardType = i < 12 ? "category" : i < 15 ? "overall" : "special";

    if (awardType === "category" || awardType === "overall") {
      distributions.push({
        id: generateId("pd"),
        prize_id: "prz_0001",
        participant_id: w.participant_id,
        distributed_at: `2026-10-18 17:${String(15 + i).padStart(2, "0")}:00`,
        operator: opers[i % opers.length],
        quantity: 1,
      });
      distributions.push({
        id: generateId("pd"),
        prize_id: "prz_0006",
        participant_id: w.participant_id,
        distributed_at: `2026-10-18 17:${String(15 + i).padStart(2, "0")}:00`,
        operator: opers[i % opers.length],
        quantity: 1,
      });
    }

    if (i < 3) {
      distributions.push({
        id: generateId("pd"),
        prize_id: "prz_0004",
        participant_id: w.participant_id,
        distributed_at: `2026-10-18 17:${String(20 + i).padStart(2, "0")}:00`,
        operator: opers[i % opers.length],
        quantity: 1,
      });
    }
    if (i < 12) {
      distributions.push({
        id: generateId("pd"),
        prize_id: "prz_0003",
        participant_id: w.participant_id,
        distributed_at: `2026-10-18 17:${String(25 + i).padStart(2, "0")}:00`,
        operator: opers[i % opers.length],
        quantity: 1,
      });
    }
    if (awardType === "special") {
      distributions.push({
        id: generateId("pd"),
        prize_id: "prz_0005",
        participant_id: w.participant_id,
        distributed_at: `2026-10-18 17:${String(35 + i).padStart(2, "0")}:00`,
        operator: opers[i % opers.length],
        quantity: 1,
      });
    }
  });

  results.forEach((r, i) => {
    if (r.status === "finished") {
      distributions.push({
        id: generateId("pd"),
        prize_id: "prz_0002",
        participant_id: r.participant_id,
        distributed_at: `2026-10-18 ${String(15 + (i % 3)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}:00`,
        operator: opers[i % opers.length],
        quantity: 1,
      });
    }
  });

  return distributions;
}

const surveyComments = [
  "赛道风景太美了，太湖边骑行真的是享受！补给站也很给力。",
  "组织非常专业，志愿者很热情，下次还会来！",
  "路况很好，就是爬坡那段有点累，不过很有成就感。",
  "补给站的香蕉和能量胶很及时，赞一个！",
  "起点出发分流做得不错，没有拥堵的感觉。",
  "赛事包很丰富，奖牌设计得很漂亮，值得收藏。",
  "希望下次能增加更多的移动厕所，中间有点不方便。",
  "医疗保障很到位，看到好几辆急救车在巡逻，很安心。",
  "引导指示牌做得很清晰，完全不用担心迷路。",
  "计时很准确，成绩出来得很快，体验非常好。",
  "摄影团队很专业，已经看到好多精彩照片了！",
  "终点的补给恢复区太棒了，热饮和小吃都有。",
  "就是报名的时候系统有点卡，其他都很满意。",
  "希望明年能增加接力组，想和朋友一起来玩。",
  "整体很棒，太湖风景名不虚传，强烈推荐！",
  "关门时间设置合理，体验感很好。",
  "骑行路线设计得很用心，有平路有起伏，不会太枯燥。",
  "志愿者小朋友们都很认真，给你们点赞！",
  "停车指引做得不错，就是停车场稍微远了点。",
  "赛事手册信息很详细，准备工作做得很充分。",
];

export function generateSurveyResponses(eventId: string, participants: Participant[]): SurveyResponse[] {
  const responses: SurveyResponse[] = [];
  const finishedP = participants.slice(0, 45);

  finishedP.forEach((p, i) => {
    const ratingsBase = [
      [5, 5, 5, 5, 5],
      [5, 4, 5, 5, 4],
      [4, 5, 4, 5, 5],
      [5, 5, 4, 4, 5],
      [4, 4, 5, 5, 4],
      [5, 4, 5, 4, 5],
      [4, 5, 5, 4, 4],
      [3, 4, 4, 3, 4],
      [5, 5, 5, 4, 5],
      [4, 4, 4, 5, 4],
    ];
    const ratings = ratingsBase[i % ratingsBase.length];
    const hasComment = i % 3 !== 0;

    const submitDate = new Date("2026-10-19T09:00:00");
    submitDate.setHours(9 + (i * 3) % 12);
    submitDate.setMinutes((i * 17) % 60);

    responses.push({
      id: generateId("sr"),
      event_id: eventId,
      participant_id: p.id,
      overall_rating: ratings[0],
      route_rating: ratings[1],
      organization_rating: ratings[2],
      aid_stations_rating: ratings[3],
      swag_rating: ratings[4],
      would_recommend: ratings[0] >= 4,
      comments: hasComment ? surveyComments[i % surveyComments.length] : undefined,
      submitted_at: formatTime(submitDate),
    });
  });

  return responses;
}

idCounter = 1;
const event = generateEvent();
const categories = generateCategories(event.id);
const routePoints = generateRoutePoints(event.id);
const volunteers = generateVolunteers(event.id);
const participants = generateParticipants(event.id, categories);
const bibNumbers = generateBibNumbers(participants, categories);
const pickupRecords = generatePickupRecords(participants);
const timeRecords = generateTimeRecords(participants, categories, routePoints);
const results = generateResults(participants, categories, timeRecords);
const awards = generateAwards(event.id, categories);
const winners = generateWinners(awards, participants, results);
const prizes = generatePrizes(event.id);
const prizeDistributions = generatePrizeDistributions(winners, prizes, participants, results);
const surveyResponses = generateSurveyResponses(event.id, participants);

export const mockData = {
  events: [event],
  categories,
  routePoints,
  volunteers,
  participants,
  bibNumbers,
  pickupRecords,
  timeRecords,
  results,
  awards,
  winners,
  prizes,
  prizeDistributions,
  surveyResponses,
};
