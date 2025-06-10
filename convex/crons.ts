import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// crons.interval(
//   "clear messages table",
//   { hours: 24 },
//   internal.messages.clearAll,
// );

export default crons;
