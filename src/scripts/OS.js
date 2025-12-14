import { db } from './firebase'; // adjust path as needed
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const addStoreNumberToOffenders = async () => {
  const offendersRef = collection(db, "offenders");
  const snapshot = await getDocs(offendersRef);

  snapshot.forEach(async (docSnap) => {
    const offender = docSnap.data();

    // If the storeNumber doesn't exist, we need to update it
    if (!offender.storeNumber) {
      const storeNumber = "DEFAULT_STORE"; // Replace with a default value or use logic to determine this

      // Update the offender document with the storeNumber
      await updateDoc(doc(db, "offenders", docSnap.id), {
        storeNumber: storeNumber,
      });

      console.log(`Updated offender ${docSnap.id} with storeNumber: ${storeNumber}`);
    }
  });
};

addStoreNumberToOffenders();