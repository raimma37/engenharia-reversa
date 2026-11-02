import { Request, Response } from "express";
import Version from "../models/Versions";

export const index = async (req: Request, res: Response): Promise<Response> => {
    const version = await Version.findByPk(1);
    return res.status(200).json({
        version: version?.versionFrontend || "5.5.4"
    });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    let version = await Version.findByPk(1);
    if (!version) {
        version = await Version.create({
            id: 1,
            versionFrontend: req.body.version || "5.5.4",
            versionBackend: "5.5"
        });
    } else {
        version.versionFrontend = req.body.version;
        await version.save();
    }

    return res.status(200).json({
        version: version.versionFrontend
    });
};
