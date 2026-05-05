import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

const DEMO = process.env.DEMO_MODE === "true";

@Injectable()
export class ApolloService {
  private readonly log = new Logger(ApolloService.name);
  private readonly base = "https://api.apollo.io/v1";

  async enrich(name: string, email: string) {
    if (DEMO) {
      this.log.log(`[DEMO] Apollo enrich for ${name}`);
      return {
        name,
        email,
        title: "Registered Nurse",
        company: "Baylor Scott & White Health",
        location: "Dallas, TX",
        linkedin_url: `https://linkedin.com/in/${name.toLowerCase().replace(" ", "-")}`,
        phone_numbers: [{ sanitized_number: "+12145550000" }],
        employment_history: [
          { title: "RN – ICU", organization_name: "Baylor Scott & White", start_date: "2021-06", current: true },
          { title: "Staff RN", organization_name: "Texas Health Resources", start_date: "2019-01", end_date: "2021-05" },
        ],
        education_history: [
          { degree: "BSN", school_name: "University of Texas at Arlington", end_date: "2019" },
        ],
      };
    }
    const res = await axios.post(
      `${this.base}/people/match`,
      { name, email },
      { headers: { "x-api-key": process.env.APOLLO_API_KEY } }
    );
    return res.data.person ?? null;
  }
}
