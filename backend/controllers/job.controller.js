// controllers/job.controller.js
import { Job } from "../models/job.model.js";

export const postJob = async (req, res) => {
    try {
        console.log('Job Post - Request body:', req.body);

        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
            });
        }

        // Map experience string to a number based on the schema
        const experienceLevelMap = {
            'Entry-Level': 1,
            'Mid-Level': 2,
            'Senior-Level': 3,
        };
        const experienceLevel = experienceLevelMap[experience];
        if (experienceLevel === undefined) {
            return res.status(400).json({
                message: "Invalid experience level. Use 'Entry-Level', 'Mid-Level', or 'Senior-Level'",
                success: false,
            });
        }

        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary),
            experienceLevel,
            location,
            jobType,
            position: Number(position),
            company: companyId,
            created_by: userId,
        });

        return res.status(201).json({
            message: "New job created successfully",
            job,
            success: true,
        });
    } catch (error) {
        console.error('Job post error:', error.message);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Validation error",
                error: error.message,
                success: false,
            });
        }
        return res.status(500).json({
            message: "Server error during job posting",
            error: error.message,
            success: false,
        });
    }
};

export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ],
        };
        const jobs = await Job.find(query).populate({
            path: "company",
        }).sort({ createdAt: -1 });
        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "Jobs not found",
                success: false,
            });
        }
        return res.status(200).json({
            jobs,
            success: true,
        });
    } catch (error) {
        console.error('Get all jobs error:', error.message);
        return res.status(500).json({
            message: "Server error while fetching jobs",
            error: error.message,
            success: false,
        });
    }
};

export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: "applications",
        });
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false,
            });
        }
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.error('Get job by ID error:', error.message);
        return res.status(500).json({
            message: "Server error while fetching job",
            error: error.message,
            success: false,
        });
    }
};

export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path: "company",
        }).sort({ createdAt: -1 });
        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "Jobs not found",
                success: false,
            });
        }
        return res.status(200).json({
            jobs,
            success: true,
        });
    } catch (error) {
        console.error('Get admin jobs error:', error.message);
        return res.status(500).json({
            message: "Server error while fetching admin jobs",
            error: error.message,
            success: false,
        });
    }
};