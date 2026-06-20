import { Router, Request, Response } from "express";
import { readDataFile, writeDataFile, generateId } from "../utils/storage.js";
import { dataFiles } from "../utils/storage.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.members, []);
  res.json({ success: true, data });
});

router.get("/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.members, []);
  const { id } = req.params;
  const item = data.find((i: any) => i.id === id);
  res.json({ success: true, data: item });
});

router.post("/", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.members, []);
  const newItem = {
    ...req.body,
    id: generateId("member"),
    points: req.body.points || 0,
    status: req.body.status || "active",
    attendance: req.body.attendance || 0,
  };
  const updatedData = [newItem, ...data];
  writeDataFile(dataFiles.members, updatedData);
  res.json({ success: true, data: newItem, message: "添加成功" });
});

router.put("/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.members, []);
  const { id } = req.params;
  const updatedData = data.map((item: any) =>
    item.id === id ? { ...item, ...req.body } : item
  );
  writeDataFile(dataFiles.members, updatedData);
  res.json({ success: true, message: "更新成功" });
});

router.delete("/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.members, []);
  const { id } = req.params;
  const updatedData = data.filter((item: any) => item.id !== id);
  writeDataFile(dataFiles.members, updatedData);
  res.json({ success: true, message: "删除成功" });
});

router.get("/points/ranking", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.members, []);
  const ranking = [...data]
    .filter((m: any) => m.status === "active")
    .sort((a: any, b: any) => b.points - a.points);
  res.json({ success: true, data: ranking });
});

router.get("/points/records", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.pointRecords, []);
  res.json({ success: true, data });
});

router.post("/points", (req: Request, res: Response) => {
  const records = readDataFile(dataFiles.pointRecords, []);
  const members = readDataFile(dataFiles.members, []);
  const { memberId, points, reason, activityId, activityName } = req.body;

  const member = members.find((m: any) => m.id === memberId);
  if (!member) {
    return res.status(404).json({ success: false, message: "成员不存在" });
  }

  const newRecord = {
    id: generateId("point"),
    memberId,
    memberName: member.name,
    points,
    reason,
    activityId,
    activityName,
    createdAt: new Date().toISOString().split("T")[0],
  };

  const updatedRecords = [newRecord, ...records];
  writeDataFile(dataFiles.pointRecords, updatedRecords);

  const updatedMembers = members.map((m: any) =>
    m.id === memberId ? { ...m, points: m.points + points } : m
  );
  writeDataFile(dataFiles.members, updatedMembers);

  res.json({ success: true, data: newRecord, message: "积分已更新" });
});

router.get("/records", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.memberRecords, []);
  res.json({ success: true, data });
});

router.post("/records", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.memberRecords, []);
  const newItem = {
    ...req.body,
    id: generateId("record"),
    date: new Date().toISOString().split("T")[0],
    status: req.body.status || "pending",
  };
  const updatedData = [newItem, ...data];
  writeDataFile(dataFiles.memberRecords, updatedData);
  res.json({ success: true, data: newItem, message: "申请已提交" });
});

router.put("/records/:id", (req: Request, res: Response) => {
  const records = readDataFile(dataFiles.memberRecords, []);
  const members = readDataFile(dataFiles.members, []);
  const { id } = req.params;
  const { status, ...rest } = req.body;

  const record = records.find((r: any) => r.id === id);

  if (status === "approved" && record?.type === "join") {
    const newMember = {
      id: generateId("member"),
      name: record.name,
      grade: record.grade || "",
      major: record.major || "",
      joinDate: new Date().toISOString().split("T")[0],
      position: "成员",
      phone: record.phone || "",
      points: 10,
      status: "active",
      attendance: 100,
    };
    const updatedMembers = [newMember, ...members];
    writeDataFile(dataFiles.members, updatedMembers);
  }

  const updatedRecords = records.map((item: any) =>
    item.id === id ? { ...item, ...rest, status } : item
  );
  writeDataFile(dataFiles.memberRecords, updatedRecords);

  res.json({ success: true, message: "已审批" });
});

export default router;
