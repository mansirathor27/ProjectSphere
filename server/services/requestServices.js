import { SupervisorRequest } from "../models/supervisorRequest.js";

export const createRequest = async(req, res, next)=>{
    const existingRequest = await SupervisorRequest.findOne({
        student: requestData.student,
        supervisor: requestData.supervisor,
        status: "pending",
    });
    if(existingRequest){
        throw new Error("You have already a sent request to this supervisor. Please wait for their response.");
    }
    const request = await SupervisorRequest.create(requestData);
    return await request.save();
};