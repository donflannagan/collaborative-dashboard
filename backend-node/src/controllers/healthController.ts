import { Request, Response } from 'express';
import { HealthService } from '../services/healthService';

export class HealthController {
    private healthService: HealthService;

    constructor() {
        this.healthService = new HealthService();
    }

    /**
     * GET /health
     * Evaluates backend health and returns JSON payload with conditional status codes
     */
    public healthCheck = (req: Request, res: Response): void => {
        try {
            const healthPayload = this.healthService.checkHealth();
            
            // Standard devops practice: return 503 if infrastructure dependencies fail
            const httpStatus = healthPayload.status === "Healthy" ? 200 : 503;
            
            res.status(httpStatus).json(healthPayload);
        } catch (error) {
            res.status(500).json({ 
                status: "Error", 
                message: "Internal tracking failure",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    };
}