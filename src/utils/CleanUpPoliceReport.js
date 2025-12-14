import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export async function cleanupPoliceReports() {
  const snap = await getDocs(collection(db, "reports"));
  let fixed = 0;

  for (const d of snap.docs) {
    const data = d.data();

    // Only fix docs that have top-level policeReport
    if (!data.policeReport) continue;

    const fields = data.fields || {};

    // If fields.policeReport already exists, keep it
    const correctPolice =
      fields.policeReport || data.policeReport;

    await updateDoc(doc(db, "reports", d.id), {
      fields: {
        ...fields,
        policeReport: correctPolice,
      },
      policeReport: null, // remove bad top-level field
    });

    fixed++;
  }

  alert(`Cleanup complete. Fixed ${fixed} reports.`);
}
