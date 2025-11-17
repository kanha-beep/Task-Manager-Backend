import Image from "../TasksModel/taskImageSchema.js"
import Tasks from "../TasksModel/tasksSchema.js"
import { taskValidation, validateUserSchema } from "../Middlewares/TasksValidate.js";
export const dashboard = async (req, res) => {
    try {
        // console.log("1. req", req.params);
        // console.log("2. body", req.body);
        const task = await Tasks.find({});
        if (!task) {
            console.log("task not found")
            return res.status(410).json({ message: "user not found" })
        }
        // console.log("1. task found", task);
        //total tasks
        const totalTasksNumber = await Tasks.countDocuments({});
        //done tasks
        // const query = 2;
        const doneTasksNumber = await Tasks.countDocuments({ completed: true })
        // console.log("2. total done: ",doneTasksNumber)
        //pending tasks
        const pendingTasksNumber = await Tasks.countDocuments({ completed: false })
        // console.log("2. total pending: ",pendingTasksNumber)
        res.json({
            totalTasksNumber, doneTasksNumber, pendingTasksNumber
        });
    } catch (e) {
        console.log("error from backend for single task", e)
    }
}
export const newTasks = async (req, res) => {
    try {
        const { error, value } = taskValidation.validate(req.body);
        const { _id } = req.user;
        if (error) {
            console.log("error of joi", error)
            return res.status(400).json("no proper task details")
        };
        const newTask = await Tasks.create({ ...value, completed: false, boss: _id });
        res.json(newTask)
    } catch (e) {
        console.log("error", e)
    }
}
export const singleTask = async (req, res) => {
    try {
        const { id } = req.params;
        // console.log("id of one task", id)
        const task = await Tasks.findById(id).populate("image").populate("boss");
        if (!task) {
            console.log("task not found")
            return res.status(410).json({ message: "user not found" })
        }
        console.log("boss of this task:", task.boss)
        res.json(task);
    } catch (e) {
        console.log("error from backend for single task", e)
    }
}
export const uploadImage = async (req, res) => {
    const { id } = req.params;
    const { filename } = req.file
    // console.log("now will break filename", req.file)
    // const {filename} = req.files;
    const newImage = await Image.create({ filename, path: req.file.path });
    // console.log("image schema updated",newImage );
    if (!req.file) return res.status(404).json({ message: "no image" })
    // console.log('image id', newImage._id)
    const task = await Tasks.findByIdAndUpdate(id, { image: newImage._id }).populate("image")
    await task.save();

    res.json(task);
}
export const checkBox = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Tasks.findById(id);
        if (!task) return res.status(400).json("no proper task found");
        // console.log("req.body for check", req.body)
        if (typeof req.body.completed === "boolean") {
            task.completed = req.body.completed;
        }
        if (typeof req.body.check === "boolean") {
            task.check = req.body.check;
        }
        // console.log("marked the task for new code", req.body.completed)
        await task.save();
        res.json(task);
    } catch (e) {
        console.log("error backend", e)
    }
}
export const editTask = async (req, res) => {
    try {
        const { id } = req.params;
        // if (req.body) console.log("req.body for edit", req.body)
        const { value, error } = validateTasksSchema.validate(req.body);
        if (error) return res.status(400).json("no edit");
        const task = await Tasks.findByIdAndUpdate(id, value);
        // console.log("id for edit", id)
        // console.log("task editted", task);
        res.json(task)
    } catch (e) {
        console.log("error edit", e)
    }
}
export const deleteTask = async (req, res) => {
    const { id } = req.params;
    const task = await Tasks.findByIdAndDelete(id);
    res.json(task);
}
export const allTasks = async (req, res) => {
    try {
        //create query and input keys = filter, sort, dueDate
        //search Tasks using this query
        const limit = parseInt(req.query.limit) || 5;
        const pager = parseInt(req.query.pager) || 1;
        // console.log("page is changing", req.query.pager)
        const skip = (pager - 1) * limit;
        //filter
        const filter = req.query.filter || "all"
        const query = {};
        if(filter === "done") query.completed = true;
        else if(filter === "pending") query.completed = false;
        else if (filter === "practice") query.check = true;
        const filterDue = req.query.filter;    // empty, filled
        // console.log("filtr due: ", filterDue)
        if (filterDue === "dueDate") query.dueDate = { $nin: [null, ""] };
        //search
        const search = req.query.search
        // console.log("search: ", search);
        // console.log("filter: ", filter)
        if(search) query.name = {$regex: search, $options: "i"}
        // console.log("tasks is working")
        // sort
    const sort = req.query.sort;
    let sortOption = {};
    console.log("sort: ", sort)
    if (sort === "title") sortOption = { name: 1 }; // A→Z
    else if (sort === "date") sortOption = { _id: -1 }; // newest first
        // find total no of posts
        const tasks = await Tasks.find(query).sort(sortOption).skip(skip).limit(limit)
        if (!tasks) return res.status(444).json({ message: " Log in first" })
        //find total no of pages
        const totalNoOfTasks = await Tasks.countDocuments();
        // console.log("total no of tasks", totalNoOfTasks)
        const totalPagesPerPage = Math.ceil(totalNoOfTasks / limit)
        // console.log("total pages: ", totalPagesPerPage)
        res.json({ message: "user token validated last step", user: req.user, tasks, totalNoOfTasks, totalPagesPerPage, pager: pager })
    } catch (error) {
        console.log("error while rendering all tasks", error)
    }
}