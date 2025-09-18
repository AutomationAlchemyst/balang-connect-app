import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Mock data for demonstration purposes
const userPoints = {
  current: 750,
  nextReward: 1000,
  level: "Community Contributor",
};

const contributionHistory = [
  { id: 1, type: "Event Booking", points: 300, date: "2024-07-15" },
  { id: 2, type: "Infaq Sponsorship", points: 450, date: "2024-07-20" },
];

export function JariahPointsCard() {
  const progressPercentage = (userPoints.current / userPoints.nextReward) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Jariah Points</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{userPoints.level}</p>
          <p className="text-4xl font-bold">{userPoints.current} PTS</p>
        </div>
        <div>
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {userPoints.nextReward - userPoints.current} points to next reward
          </p>
        </div>
        <Separator />
        <div>
          <h4 className="text-sm font-semibold mb-2">Contribution History</h4>
          <ul className="space-y-2">
            {contributionHistory.map((item) => (
              <li key={item.id} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium">{item.type}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <p className="font-semibold text-green-500">+{item.points} PTS</p>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
