import { Router, Request, Response } from "express";
import { readDataFile, writeDataFile, generateId } from "../utils/storage.js";
import { dataFiles } from "../utils/storage.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.activities, []);
  res.json({ success: true, data });
});

router.get("/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.activities, []);
  const { id } = req.params;
  const item = data.find((i: any) => i.id === id);
  res.json({ success: true, data: item });
});

router.post("/", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.activities, []);
  const newItem = {
    ...req.body,
    id: generateId("act"),
    participantCount: req.body.participantCount || 0,
    status: req.body.status || "planning",
  };
  const updatedData = [newItem, ...data];
  writeDataFile(dataFiles.activities, updatedData);
  res.json({ success: true, data: newItem, message: "创建成功" });
});

router.put("/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.activities, []);
  const { id } = req.params;
  const updatedData = data.map((item: any) =>
    item.id === id ? { ...item, ...req.body } : item
  );
  writeDataFile(dataFiles.activities, updatedData);
  res.json({ success: true, message: "更新成功" });
});

router.delete("/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.activities, []);
  const { id } = req.params;
  const updatedData = data.filter((item: any) => item.id !== id);
  writeDataFile(dataFiles.activities, updatedData);
  res.json({ success: true, message: "删除成功" });
});

router.get("/:id/plans", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.planVersions, []);
  const { id } = req.params;
  const plans = data.filter((p: any) => p.activityId === id);
  res.json({ success: true, data: plans });
});

router.get("/plans/all", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.planVersions, []);
  res.json({ success: true, data });
});

router.post("/:id/plans", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.planVersions, []);
  const { id } = req.params;
  const activities = readDataFile(dataFiles.activities, []);
  const activity = activities.find((a: any) => a.id === id);

  const newItem = {
    ...req.body,
    id: generateId("plan"),
    activityId: id,
    activityName: activity?.name || "",
    status: req.body.status || "draft",
    createdAt: new Date().toISOString().split("T")[0],
  };
  const updatedData = [newItem, ...data];
  writeDataFile(dataFiles.planVersions, updatedData);
  res.json({ success: true, data: newItem, message: "创建成功" });
});

router.put("/plans/:id", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.planVersions, []);
  const { id } = req.params;
  const updatedData = data.map((item: any) =>
    item.id === id ? { ...item, ...req.body } : item
  );
  writeDataFile(dataFiles.planVersions, updatedData);
  res.json({ success: true, message: "更新成功" });
});

router.get("/:id/evaluation", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.evaluations, []);
  const { id } = req.params;
  const evaluation = data.find((e: any) => e.activityId === id);
  res.json({ success: true, data: evaluation });
});

router.get("/evaluations/all", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.evaluations, []);
  res.json({ success: true, data });
});

router.post("/:id/evaluation", (req: Request, res: Response) => {
  const data = readDataFile(dataFiles.evaluations, []);
  const { id } = req.params;
  const activities = readDataFile(dataFiles.activities, []);
  const activity = activities.find((a: any) => a.id === id);

  const existingIndex = data.findIndex((e: any) => e.activityId === id);

  const newItem = {
    ...req.body,
    id: existingIndex >= 0 ? data[existingIndex].id : generateId("eval"),
    activityId: id,
    activityName: activity?.name || "",
    createdAt: new Date().toISOString().split("T")[0],
  };

  let updatedData;
  if (existingIndex >= 0) {
    updatedData = data.map((item: any, index: number) =>
      index === existingIndex ? newItem : item
    );
  } else {
    updatedData = [newItem, ...data];
  }

  writeDataFile(dataFiles.evaluations, updatedData);
  res.json({ success: true, data: newItem, message: "评估已保存" });
});

export default router;
