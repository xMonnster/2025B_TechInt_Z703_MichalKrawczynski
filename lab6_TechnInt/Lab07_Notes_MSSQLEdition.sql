/* Lab12_Notes_MSSQLEdition.sql
   Notatki + tagi + wyszukiwanie – schema + seed
*/
SET NOCOUNT ON;

IF OBJECT_ID('dbo.NoteTags', 'U') IS NOT NULL DROP TABLE dbo.NoteTags;
IF OBJECT_ID('dbo.Tags', 'U') IS NOT NULL DROP TABLE dbo.Tags;
IF OBJECT_ID('dbo.Notes', 'U') IS NOT NULL DROP TABLE dbo.Notes;

CREATE TABLE dbo.Notes (
  Id        INT IDENTITY(1,1) PRIMARY KEY,
  Title     NVARCHAR(200) NOT NULL,
  Body      NVARCHAR(MAX) NOT NULL,
  CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Notes_CreatedAt DEFAULT (SYSUTCDATETIME())
);

CREATE TABLE dbo.Tags (
  Id   INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE dbo.NoteTags (
  NoteId INT NOT NULL CONSTRAINT FK_NoteTags_Notes FOREIGN KEY REFERENCES dbo.Notes(Id) ON DELETE CASCADE,
  TagId  INT NOT NULL CONSTRAINT FK_NoteTags_Tags  FOREIGN KEY REFERENCES dbo.Tags(Id)  ON DELETE CASCADE,
  CONSTRAINT PK_NoteTags PRIMARY KEY (NoteId, TagId)
);

-- Seed
INSERT dbo.Notes(Title,Body) VALUES (N'Witaj',N'To jest pierwsza notatka'), (N'Plan',N'Kupić mleko i chleb');
INSERT dbo.Tags(Name) VALUES (N'work'),(N'home'),(N'ideas');
INSERT dbo.NoteTags(NoteId,TagId) VALUES (1,1),(2,2);

-- LIKE search example
DECLARE @q NVARCHAR(100) = N'Plan';
SELECT * FROM dbo.Notes WHERE Title LIKE N'%' + @q + N'%' OR Body LIKE N'%' + @q + N'%' ORDER BY Id DESC;

-- Optional: Full-Text Search (requires FTS feature)
-- CREATE FULLTEXT CATALOG ftc AS DEFAULT;
-- CREATE FULLTEXT INDEX ON dbo.Notes(Title LANGUAGE 1045, Body LANGUAGE 1045) KEY INDEX PK__Notes__Id;
