const express = require("express");
const pool = require("./db");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const authMiddleware = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Job Application Tracker Backend is running!");
});

app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected successfully",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});
app.post("/api/applications", authMiddleware, async (req, res) => {
    try {
        const { company_name, position, status, notes } = req.body;

        const userId = req.user.id;

        if (!company_name || !position || !status) {
            return res.status(400).json({
                message: "Company name, position and status are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO job_applications
             (company_name, position, status, notes, user_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [company_name, position, status, notes || null, userId]
        );

        res.status(201).json({
            message: "Application created successfully",
            application: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});
app.get("/api/applications", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const { search, status } = req.query;
       const page = Number(req.query.page) || 1;
       const limit = Number(req.query.limit) || 5;
        const offset = (page - 1) * limit;
        let query = "SELECT * FROM job_applications";
        const conditions = ["user_id = $1"];
        const values = [userId];

        if (search) {
            conditions.push(
                `(company_name ILIKE $${values.length + 1}
                OR position ILIKE $${values.length + 1})`
            );

            values.push(`%${search}%`);
        }

        if (status) {
            conditions.push(`status ILIKE $${values.length + 1}`);
            values.push(status);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += ` ORDER BY id DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;

        values.push(limit, offset);

        const result = await pool.query(query, values);
        const countQuery = `
    SELECT COUNT(*)
    FROM job_applications
    WHERE ${conditions.join(" AND ")}`;

const countResult = await pool.query(countQuery, values.slice(0, -2));
        const totalPages = Math.ceil(
        countResult.rows[0].count / limit
        );

        res.json({
    data: result.rows,
    total: countResult.rows[0].count,
     page: Number(page),
    limit: Number(limit),
    totalPages: totalPages
    });
    } catch (error) {
        console.error("Error fetching applications:", error);

        res.status(500).json({
            message: "Failed to fetch applications"
        });
    }
});
app.get("/api/applications/stats", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'Applied') AS applied,
                COUNT(*) FILTER (WHERE status = 'Interview') AS interview,
                COUNT(*) FILTER (WHERE status = 'Rejected') AS rejected,
                COUNT(*) FILTER (WHERE status = 'Selected') AS selected
             FROM job_applications
             WHERE user_id = $1`,
            [userId]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error fetching stats:", error);

        res.status(500).json({
            message: "Failed to fetch application stats"
        });
    }
});
app.get("/api/applications/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
    `SELECT * FROM job_applications
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
);

       if (result.rows.length === 0) {
    return res.status(404).json({
        message: "Application not found"
    });
}

        res.json({
    application: result.rows[0]
});

    } catch (error) {
        console.error("Error fetching application:", error);

        res.status(500).json({
            message: "Failed to fetch application"
        });
    }
});
app.put("/api/applications/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { company_name, position, status, notes } = req.body;

        if (!company_name || !position || !status) {
            return res.status(400).json({
                message: "Company name, position and status are required"
            });
        }

        const result = await pool.query(
    `UPDATE job_applications 
     SET company_name = $1, 
         position = $2, 
         status = $3, 
         notes = $4 
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [company_name, position, status, notes, id, userId]
);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error updating application:", error);

        res.status(500).json({
            message: "Failed to update application"
        });
    }
});
app.patch("/api/applications/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { status, notes } = req.body;

        if (status === undefined && notes === undefined) {
            return res.status(400).json({
                message: "At least one field is required"
            });
        }

        const result = await pool.query(
    `UPDATE job_applications 
     SET status = COALESCE($1, status), 
         notes = COALESCE($2, notes) 
     WHERE id = $3 AND user_id = $4 
     RETURNING *`,
    [status ?? null, notes ?? null, id, userId]
);
        if (result.rows.length === 0) {
    return res.status(404).json({
        message: "Application not found"
    });
}

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating application:", error);

        res.status(500).json({
            message: "Failed to update application"
        });
    }
});
app.delete("/api/applications/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            `DELETE FROM job_applications
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.json({
            message: "Application deleted successfully",
            application: result.rows[0]
        });

    } catch (error) {
        console.error("Error deleting application:", error);

        res.status(500).json({
            message: "Failed to delete application"
        });
    }
});
app.listen(5000, () => {
    console.log("Server running on port 5000");
});