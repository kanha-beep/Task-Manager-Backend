import express from "express"
const router = express.Router()
import verifyToken from "../Middlewares/middleware.js"
import uploads from "../Middlewares/TasksMulter.js"
import cron from "node-cron"
import { dashboard , newTasks, singleTask, uploadImage, checkBox, editTask, deleteTask, allTasks} from "../controllers/TaskController.js"
//api/tasks
//crons
//deadline
cron.schedule("*/10 * * * * *", async ()=> {
    const now = new Date();
    console.log("current hour: ", now.getDate());
    const after = now.setDate(now.getDate()+1);
    console.log("after hour:",after)
    const task = await Tasks.find({});
})
//send mail
//dashboard
router.get("/dashboard", dashboard)
//new tasks
router.post("/new", verifyToken, newTasks)
//get task by id
router.get("/:id", verifyToken, singleTask)
//image
router.post("/:id/image", uploads.single("image"), uploadImage)
//update completed
router.patch("/:id", checkBox)
//edit
router.patch("/:id/edit", editTask)
//delete tasks
router.delete("/:id", verifyToken, deleteTask)

//get all tasks
router.get("/", verifyToken, allTasks)

export default router;