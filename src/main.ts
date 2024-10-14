// Automatically load environment variables from a `.env` file
import "@std/dotenv/load";

const apiToken = Deno.env.get("API_TOKEN");

function greet(name: string): string {
    return `Hello, ${apiToken}s!`;
  }
  
  console.log(greet("world"));
