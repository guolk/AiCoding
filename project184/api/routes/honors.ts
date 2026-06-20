import { Router, Request, Response } from "express";
import { readDataFile, writeDataFile, generateId } from "../utils/storage.js";
import { dataFiles } from "../utils/storage.js";

const router = Router();

router.get("/achievements", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.achievements, []);
  res.json({ success: true, data });
});

router.get("/achievements/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.achievements, []);
  const { id } = req.params;
  const item = data.find((i: any) => i.id === id);
  res.json({ success: true, data: item });
});

router.post("/achievements", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.achievements, []);
  const members = readDataFile(dataFiles.members, []);
  const { memberId, ...rest } = req.body;

  const member = members.find((m: any) => m.id === memberId);

  const newItem = {
    ...rest,
    memberId,
    memberName: member?.name || "",
    id: generateId("ach"),
    createdAt: new Date().toISOString().split("T")[0],
  };
  const updatedData = [newItem, ...data];
  writeDataFile(dataFiles.achievements, updatedData);
  res.json({ success: true, data: newItem, message: "事迹已添加" });
});

router.put("/achievements/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.achievements, []);
  const { id } = req.params;
  const updatedData = data.map((item: any) =>
    item.id === id ? { ...item, ...req.body } : item
  );
  writeDataFile(dataFiles.achievements, updatedData);
  res.json({ success: true, message: "更新成功" });
});

router.delete("/achievements/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.achievements, []);
  const { id } = req.params;
  const updatedData = data.filter((item: any) => item.id !== id);
  writeDataFile(dataFiles.achievements, updatedData);
  res.json({ success: true, message: "删除成功" });
});

router.get("/applications", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.honorApplications, []);
  res.json({ success: true, data });
});

router.post("/applications", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.honorApplications, []);
  const members = readDataFile(dataFiles.members, []);
  const { memberId, ...rest } = req.body;

  const member = members.find((m: any) => m.id === memberId);

  const newItem = {
    ...rest,
    memberId,
    memberName: member?.name || "",
    id: generateId("app"),
    applicationDate: new Date().toISOString().split("T")[0],
    status: rest.status || "draft",
    materials: rest.materials || [],
  };
  const updatedData = [newItem, ...data];
  writeDataFile(dataFiles.honorApplications, updatedData);
  res.json({ success: true, data: newItem, message: "申报已创建" });
});

router.put("/applications/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.honorApplications, []);
  const { id } = req.params;
  const updatedData = data.map((item: any) =>
    item.id === id ? { ...item, ...req.body } : item
  );
  writeDataFile(dataFiles.honorApplications, updatedData);
  res.json({ success: true, message: "更新成功" });
});

export default router;
