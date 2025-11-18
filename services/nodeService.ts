import { Node } from '../types';

const API_URL = 'http://localhost:5000/api/nodes';

export const getNodes = async (): Promise<Node[]> => {
  try {
    const response = await fetch(API_URL);  // ← Fixed typo: reponse → response
    const nodes = await response.json();    // ← Fixed naming: node → nodes
    return nodes;
  } catch (error) {
    console.error("Failed to fetch nodes from API", error);
    return [];
  }
};

export const saveNodes = async (nodes: Node[]): Promise<void> => {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nodes),
    });
  } catch (error) {
    console.error("Failed to save nodes to API", error);
  }
};

//the response from the webpage comes like 
//{error:... etc, in the form of json
//} throw is essentially raise in python, which 
//raises an exception
export const deleteNode = async (id): Promise<void> => {
  try {
    //diff url as we have to send the url which is to be deleted
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })
    //new error for places where we can have errors
    //and we discovered it, and normal error for
    //expected errors
    if(!response.ok){
      throw new Error("Failed to delete node");
    }
    console.log(`Node deleted successfully with id: ${id}`);
  } catch(error) {
    console.error("Error deleting node:", error);
    throw error;
  }

};