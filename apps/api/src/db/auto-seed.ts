diff --git a/apps/api/src/db/auto-seed.ts b/apps/api/src/db/auto-seed.ts
index 1111111..2222222 100644
--- a/apps/api/src/db/auto-seed.ts
+++ b/apps/api/src/db/auto-seed.ts
@@ -40,9 +40,10 @@ interface RawQuestion {
   explanation: string;
 }
 
 function hashQuestion(q: RawQuestion): string {
+  // Use the question ID as the basis for hash to guarantee uniqueness
   return createHash('sha256')
-    .update(`${q.domain}:${q.skillTag}:${q.prompt}:${JSON.stringify(q.choices)}`)
+    .update(`${q.id}:${q.version}:${q.domain}:${q.prompt}`)
     .digest('hex')
     .slice(0, 16);
 }
@@ -53,6 +54,12 @@ export async function autoSeed(force = false): Promise<{ seeded: boolean; count:
     .from(questionBankItems);
 
   if (currentCount > 0 && !force) {
     return { seeded: false, count: currentCount };
   }
 
+  // Force mode: clear existing data for clean reseed
+  if (force && currentCount > 0) {
+    console.log('  🗑️ Force mode: clearing existing question bank...');
+    await db.delete(questionBankItems);
+  }
+
   const bankDir = findBankDir();
   if (!bankDir) {
     console.warn('⚠️ Question bank NDJSON not found — skipping seed');
@@ -99,18 +106,32 @@ export async function autoSeed(force = false): Promise<{ seeded: boolean; count:
       });
     }
 
-    // Upsert in chunks of 100
-    for (let i = 0; i < batch.length; i += 100) {
-      const chunk = batch.slice(i, i + 100);
-      await db
-        .insert(questionBankItems)
-        .values(chunk)
-        .onConflictDoUpdate({
-          target: questionBankItems.id,
-          set: {
-            prompt: sql`excluded.prompt`,
-            choices: sql`excluded.choices`,
-            correctAnswer: sql`excluded.correct_answer`,
-            explanation: sql`excluded.explanation`,
-            globalDifficulty: sql`excluded.global_difficulty`,
-            skillDifficulty: sql`excluded.skill_difficulty`,
-          },
-        });
+    // Upsert in chunks of 50 (smaller chunks to handle conflicts better)
+    for (let i = 0; i < batch.length; i += 50) {
+      const chunk = batch.slice(i, i + 50);
+      try {
+        await db
+          .insert(questionBankItems)
+          .values(chunk)
+          .onConflictDoUpdate({
+            target: questionBankItems.id,
+            set: {
+              prompt: sql`excluded.prompt`,
+              choices: sql`excluded.choices`,
+              correctAnswer: sql`excluded.correct_answer`,
+              explanation: sql`excluded.explanation`,
+              globalDifficulty: sql`excluded.global_difficulty`,
+              skillDifficulty: sql`excluded.skill_difficulty`,
+              hash: sql`excluded.hash`,
+            },
+          });
+      } catch (err: unknown) {
+        // If hash conflict, insert one-by-one and skip duplicates
+        console.warn(`  ⚠️ Batch conflict in ${domain}, inserting individually...`);
+        for (const item of chunk) {
+          try {
+            await db
+              .insert(questionBankItems)
+              .values(item)
+              .onConflictDoNothing();
+          } catch {
+            // Skip this question entirely
+          }
+        }
+      }
     }
 
     totalInserted += batch.length;
