-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "GovLevel" AS ENUM ('NATIONAL', 'STATE', 'CITY', 'LOCAL');

-- CreateEnum
CREATE TYPE "JurisdictionType" AS ENUM ('NATION', 'STATE', 'UT', 'CITY', 'DISTRICT', 'LOK_SABHA_CONSTITUENCY', 'ASSEMBLY_CONSTITUENCY', 'WARD');

-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('MINISTRY', 'DEPARTMENT', 'LEGISLATIVE_HOUSE', 'EXECUTIVE_OFFICE', 'COURT', 'LOCAL_BODY');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('HEAD_OF_GOVERNMENT', 'MINISTER', 'LEGISLATOR', 'JUDGE', 'CIVIL_SERVANT', 'LOCAL_REPRESENTATIVE');

-- CreateEnum
CREATE TYPE "LawKind" AS ENUM ('BILL', 'ACT');

-- CreateEnum
CREATE TYPE "LawStatus" AS ENUM ('INTRODUCED', 'PASSED', 'ENACTED', 'AMENDED', 'REPEALED');

-- CreateEnum
CREATE TYPE "LawLevel" AS ENUM ('CENTRAL', 'STATE');

-- CreateEnum
CREATE TYPE "RightCategory" AS ENUM ('EQUALITY', 'FREEDOM', 'AGAINST_EXPLOITATION', 'FREEDOM_OF_RELIGION', 'CULTURAL_EDUCATIONAL', 'CONSTITUTIONAL_REMEDIES', 'DIRECTIVE_PRINCIPLE', 'STATUTORY');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "TranslationStatus" AS ENUM ('MACHINE', 'REVIEWED');

-- CreateEnum
CREATE TYPE "CorrectionStatus" AS ENUM ('OPEN', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('PERSON', 'POSITION', 'INSTITUTION', 'JURISDICTION', 'LAW', 'RIGHT');

-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "symbolUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "photoUrl" TEXT,
    "bio" TEXT,
    "bioStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "dateOfBirth" TIMESTAMP(3),
    "partyId" TEXT,
    "officeAddress" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "officialUrl" TEXT,
    "sourceKey" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InstitutionType" NOT NULL,
    "description" TEXT,
    "descriptionStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "parentId" TEXT,
    "jurisdictionId" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jurisdiction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "JurisdictionType" NOT NULL,
    "level" "GovLevel" NOT NULL,
    "parentId" TEXT,
    "boundaryGeoJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jurisdiction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "roleType" "RoleType" NOT NULL,
    "responsibilities" TEXT,
    "responsibilitiesStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "institutionId" TEXT NOT NULL,
    "jurisdictionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenure" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HierarchyEdge" (
    "id" TEXT NOT NULL,
    "superiorId" TEXT NOT NULL,
    "subordinateId" TEXT NOT NULL,
    "relationLabel" TEXT,

    CONSTRAINT "HierarchyEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Law" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "LawKind" NOT NULL,
    "status" "LawStatus" NOT NULL,
    "level" "LawLevel" NOT NULL,
    "subjectArea" TEXT,
    "year" INTEGER,
    "officialTextUrl" TEXT NOT NULL,
    "plainSummary" TEXT,
    "summaryStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "sponsoringInstitutionId" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Law_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawSponsor" (
    "id" TEXT NOT NULL,
    "lawId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,

    CONSTRAINT "LawSponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Right" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "RightCategory" NOT NULL,
    "articleCitation" TEXT,
    "officialSourceUrl" TEXT NOT NULL,
    "plainExplanation" TEXT,
    "explanationStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "appliesTo" TEXT,
    "relatedLawId" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Right_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Citation" (
    "id" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Citation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" "TranslationStatus" NOT NULL DEFAULT 'MACHINE',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "sourceHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Correction" (
    "id" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "CorrectionStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Correction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocChunk" (
    "id" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL DEFAULT 'en',
    "content" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL DEFAULT 0,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LawJurisdiction" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LawJurisdiction_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Party_name_key" ON "Party"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Person_sourceKey_key" ON "Person"("sourceKey");

-- CreateIndex
CREATE INDEX "Person_fullName_idx" ON "Person"("fullName");

-- CreateIndex
CREATE INDEX "Person_partyId_idx" ON "Person"("partyId");

-- CreateIndex
CREATE INDEX "Institution_type_idx" ON "Institution"("type");

-- CreateIndex
CREATE INDEX "Institution_jurisdictionId_idx" ON "Institution"("jurisdictionId");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_name_jurisdictionId_key" ON "Institution"("name", "jurisdictionId");

-- CreateIndex
CREATE INDEX "Jurisdiction_type_idx" ON "Jurisdiction"("type");

-- CreateIndex
CREATE INDEX "Jurisdiction_parentId_idx" ON "Jurisdiction"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Jurisdiction_type_name_parentId_key" ON "Jurisdiction"("type", "name", "parentId");

-- CreateIndex
CREATE INDEX "Position_roleType_idx" ON "Position"("roleType");

-- CreateIndex
CREATE INDEX "Position_institutionId_idx" ON "Position"("institutionId");

-- CreateIndex
CREATE INDEX "Position_jurisdictionId_idx" ON "Position"("jurisdictionId");

-- CreateIndex
CREATE UNIQUE INDEX "Position_title_institutionId_jurisdictionId_key" ON "Position"("title", "institutionId", "jurisdictionId");

-- CreateIndex
CREATE INDEX "Tenure_personId_idx" ON "Tenure"("personId");

-- CreateIndex
CREATE INDEX "Tenure_positionId_idx" ON "Tenure"("positionId");

-- CreateIndex
CREATE INDEX "Tenure_isCurrent_idx" ON "Tenure"("isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "Tenure_personId_positionId_startDate_key" ON "Tenure"("personId", "positionId", "startDate");

-- CreateIndex
CREATE INDEX "HierarchyEdge_superiorId_idx" ON "HierarchyEdge"("superiorId");

-- CreateIndex
CREATE INDEX "HierarchyEdge_subordinateId_idx" ON "HierarchyEdge"("subordinateId");

-- CreateIndex
CREATE UNIQUE INDEX "HierarchyEdge_superiorId_subordinateId_key" ON "HierarchyEdge"("superiorId", "subordinateId");

-- CreateIndex
CREATE UNIQUE INDEX "Law_officialTextUrl_key" ON "Law"("officialTextUrl");

-- CreateIndex
CREATE INDEX "Law_kind_idx" ON "Law"("kind");

-- CreateIndex
CREATE INDEX "Law_status_idx" ON "Law"("status");

-- CreateIndex
CREATE INDEX "Law_level_idx" ON "Law"("level");

-- CreateIndex
CREATE INDEX "Law_year_idx" ON "Law"("year");

-- CreateIndex
CREATE INDEX "Law_subjectArea_idx" ON "Law"("subjectArea");

-- CreateIndex
CREATE INDEX "Law_sponsoringInstitutionId_idx" ON "Law"("sponsoringInstitutionId");

-- CreateIndex
CREATE INDEX "LawSponsor_personId_idx" ON "LawSponsor"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "LawSponsor_lawId_personId_key" ON "LawSponsor"("lawId", "personId");

-- CreateIndex
CREATE UNIQUE INDEX "Right_slug_key" ON "Right"("slug");

-- CreateIndex
CREATE INDEX "Right_category_idx" ON "Right"("category");

-- CreateIndex
CREATE INDEX "Right_relatedLawId_idx" ON "Right"("relatedLawId");

-- CreateIndex
CREATE INDEX "Citation_entityType_entityId_idx" ON "Citation"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Citation_entityType_entityId_field_sourceUrl_key" ON "Citation"("entityType", "entityId", "field", "sourceUrl");

-- CreateIndex
CREATE INDEX "Translation_languageCode_status_idx" ON "Translation"("languageCode", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_entityType_entityId_field_languageCode_key" ON "Translation"("entityType", "entityId", "field", "languageCode");

-- CreateIndex
CREATE INDEX "Correction_entityType_entityId_idx" ON "Correction"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Correction_status_idx" ON "Correction"("status");

-- CreateIndex
CREATE INDEX "DocChunk_entityType_entityId_idx" ON "DocChunk"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "DocChunk_languageCode_idx" ON "DocChunk"("languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "DocChunk_entityType_entityId_languageCode_chunkIndex_key" ON "DocChunk"("entityType", "entityId", "languageCode", "chunkIndex");

-- CreateIndex
CREATE INDEX "_LawJurisdiction_B_index" ON "_LawJurisdiction"("B");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Institution" ADD CONSTRAINT "Institution_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Institution" ADD CONSTRAINT "Institution_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jurisdiction" ADD CONSTRAINT "Jurisdiction_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenure" ADD CONSTRAINT "Tenure_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenure" ADD CONSTRAINT "Tenure_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HierarchyEdge" ADD CONSTRAINT "HierarchyEdge_superiorId_fkey" FOREIGN KEY ("superiorId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HierarchyEdge" ADD CONSTRAINT "HierarchyEdge_subordinateId_fkey" FOREIGN KEY ("subordinateId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Law" ADD CONSTRAINT "Law_sponsoringInstitutionId_fkey" FOREIGN KEY ("sponsoringInstitutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawSponsor" ADD CONSTRAINT "LawSponsor_lawId_fkey" FOREIGN KEY ("lawId") REFERENCES "Law"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawSponsor" ADD CONSTRAINT "LawSponsor_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Right" ADD CONSTRAINT "Right_relatedLawId_fkey" FOREIGN KEY ("relatedLawId") REFERENCES "Law"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LawJurisdiction" ADD CONSTRAINT "_LawJurisdiction_A_fkey" FOREIGN KEY ("A") REFERENCES "Jurisdiction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LawJurisdiction" ADD CONSTRAINT "_LawJurisdiction_B_fkey" FOREIGN KEY ("B") REFERENCES "Law"("id") ON DELETE CASCADE ON UPDATE CASCADE;
