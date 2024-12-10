
  // Import the functions you need from the SDKs you need
  import { currentUser } from "./auth.js";
  import { db } from "./firebaseConfig.js"

  import {
    collection,
    addDoc,
    setDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
  } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

    
  // Add a Gig
  export async function addGig(gig){
    try{
        if (!currentUser){
          throw new Error("User is not authenticated");
        }
        const userId = currentUser.uid;
        console.log("userID: ", userId);
        const userRef = doc(db, "users", userId);
        await setDoc(
          userRef,
          {
            email: currentUser.email,
            name: currentUser.displayName,
          },
          { merge: true }
        );
        const gigsRef = collection(userRef, "gigs");

        const docRef = await addDoc(gigsRef, gig);
        return {id: docRef.id, ...gig };
    } catch(error) {
        console.error("error adding gig: ", error);
    }
  }



  // Get Gigs
  export async function getGigs() {
    const gigs = [];
    try{
        if (!currentUser) {
          throw new Error("User is not authenticated");
        }
        const userId = currentUser.uid;
        const gigsRef = collection(doc(db, "users", userId), "gigs");

        const querySnapshot = await getDocs(gigsRef);
        querySnapshot.forEach((doc) => {
            gigs.push({ id: doc.id, ...doc.data() });
        });
    }catch(error){
        console.error("error retrieving gigs: ", error)
    }
    return gigs;
  }

  // Delete Gigs
  export async function deleteGig(id){
    try{
      if (!currentUser) {
        throw new Error("User is not authenticated");
      }
      const userId = currentUser.uid;
        await deleteDoc(doc(db, "users", userId, "gigs", id));
    } catch(error) {
        console.error("error deleting gigs: ", error);
    }
  }


  // Update Gigs
  export async function updateGig(id, updatedData){
    try{
      if (!currentUser) {
        throw new Error("User is not authenticated");
      }
        const userId = currentUser.uid;
        const gigRef = doc(db, "users", userId, "gigs", id);
        await updateDoc(gigRef, updatedData);
    }catch (error) {
        console.error("error updating gig: ", error);
    }
  }
