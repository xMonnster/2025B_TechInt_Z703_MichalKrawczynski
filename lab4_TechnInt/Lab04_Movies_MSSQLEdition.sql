/* Lab10_Movies_MSSQLEdition.sql
   Filmy i oceny – schema + seed + ranking view
*/
SET NOCOUNT ON;

IF OBJECT_ID('dbo.Ratings', 'U') IS NOT NULL DROP TABLE dbo.Ratings;
IF OBJECT_ID('dbo.Movies', 'U') IS NOT NULL DROP TABLE dbo.Movies;

CREATE TABLE dbo.Movies (
  Id    INT IDENTITY(1,1) PRIMARY KEY,
  Title NVARCHAR(200) NOT NULL,
  [Year] INT NOT NULL
);

CREATE TABLE dbo.Ratings (
  Id      INT IDENTITY(1,1) PRIMARY KEY,
  MovieId INT NOT NULL CONSTRAINT FK_Ratings_Movies FOREIGN KEY REFERENCES dbo.Movies(Id) ON DELETE CASCADE,
  Score   INT NOT NULL CONSTRAINT CK_Ratings_Score CHECK (Score BETWEEN 1 AND 5)
);

-- Seed
INSERT dbo.Movies(Title,[Year]) VALUES (N'Inception',2010),(N'Matrix',1999),(N'Arrival',2016);
INSERT dbo.Ratings(MovieId,Score) VALUES (1,5),(1,4),(2,5),(3,4),(3,5);

-- Ranking view
CREATE OR ALTER VIEW dbo.vMoviesRanking AS
SELECT m.Id, m.Title, m.[Year],
       CAST(AVG(CAST(r.Score AS DECIMAL(5,2))) AS DECIMAL(5,2)) AS AvgScore,
       COUNT(r.Id) AS Votes
FROM dbo.Movies m
LEFT JOIN dbo.Ratings r ON r.MovieId = m.Id
GROUP BY m.Id, m.Title, m.[Year];

-- Example ranking
SELECT * FROM dbo.vMoviesRanking ORDER BY AvgScore DESC, Votes DESC;
