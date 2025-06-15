import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("updateOpenRouterModels", { hours: 12 }, internal.models.openrouter.updateModelInfo);

export default crons;
