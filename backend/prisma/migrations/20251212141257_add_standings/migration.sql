-- CreateTable
CREATE TABLE "standings" (
    "id" SERIAL NOT NULL,
    "rank" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "form" TEXT,
    "played" INTEGER NOT NULL,
    "won" INTEGER NOT NULL,
    "draw" INTEGER NOT NULL,
    "lost" INTEGER NOT NULL,
    "goals_for" INTEGER NOT NULL,
    "goals_against" INTEGER NOT NULL,
    "goals_diff" INTEGER NOT NULL,
    "league_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,

    CONSTRAINT "standings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("league_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;
