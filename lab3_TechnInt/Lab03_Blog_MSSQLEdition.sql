/* Lab09_Blog_MSSQLEdition.sql
   Blog + komentarze (moderacja) – schema + seed + testy
*/
SET NOCOUNT ON;

IF OBJECT_ID('dbo.Comments', 'U') IS NOT NULL DROP TABLE dbo.Comments;
IF OBJECT_ID('dbo.Posts', 'U') IS NOT NULL DROP TABLE dbo.Posts;

CREATE TABLE dbo.Posts (
  Id        INT IDENTITY(1,1) PRIMARY KEY,
  Title     NVARCHAR(200) NOT NULL,
  Body      NVARCHAR(MAX) NOT NULL,
  CreatedAt DATETIME2(0)  NOT NULL CONSTRAINT DF_Posts_CreatedAt DEFAULT (SYSUTCDATETIME())
);

CREATE TABLE dbo.Comments (
  Id        INT IDENTITY(1,1) PRIMARY KEY,
  PostId    INT NOT NULL CONSTRAINT FK_Comments_Posts FOREIGN KEY REFERENCES dbo.Posts(Id) ON DELETE CASCADE,
  Author    NVARCHAR(100) NOT NULL,
  Body      NVARCHAR(1000) NOT NULL,
  CreatedAt DATETIME2(0)  NOT NULL CONSTRAINT DF_Comments_CreatedAt DEFAULT (SYSUTCDATETIME()),
  Approved  BIT NOT NULL CONSTRAINT DF_Comments_Approved DEFAULT (0)
);

CREATE INDEX IX_Comments_Post ON dbo.Comments(PostId) INCLUDE(Approved, CreatedAt);

-- Seed
INSERT dbo.Posts(Title, Body) VALUES (N'Pierwszy post', N'Witaj w blogu demo');

-- Add comment (pending)
DECLARE @PostId INT = SCOPE_IDENTITY(); -- Id of previous insert
INSERT dbo.Comments(PostId, Author, Body) VALUES (@PostId, N'Ala', N'Brawo!');

-- Approve comment
-- UPDATE dbo.Comments SET Approved = 1 WHERE Id = <CommentId>;

-- Public view
SELECT c.* FROM dbo.Comments AS c WHERE c.PostId=@PostId AND c.Approved=1 ORDER BY c.Id DESC;
