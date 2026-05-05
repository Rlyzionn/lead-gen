import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class CalendlyService {
  private readonly base = "https://api.calendly.com";

  async generateBookingLink(recruiterId: string, candidateId: string): Promise<string> {
    const res = await axios.post(
      `${this.base}/scheduling_links`,
      { max_event_count: 1, owner: recruiterId, owner_type: "EventType" },
      { headers: { Authorization: `Bearer ${process.env.CALENDLY_API_KEY}` } }
    );
    return res.data.resource.booking_url;
  }
}
