const editVacation = async (
    userToken: string,
    vacationID: number,
    updatedVacation: {
      title: string;
      description: string;
      startDate: string;
      endDate: string;
      price: number;
      imageFile?: File | null;
    }
  ) => {
    const formData = new FormData();
    formData.append("title", updatedVacation.title);
    formData.append("description", updatedVacation.description);
    formData.append("startDate", updatedVacation.startDate);
    formData.append("endDate", updatedVacation.endDate);
    formData.append("price", String(updatedVacation.price));
  
    if (updatedVacation.imageFile) {
      formData.append("image", updatedVacation.imageFile);
    }
  
    const res = await fetch(`http://localhost:3000/edit/${vacationID}`, {
      method: "PATCH",
      headers: {
        "x-auth-token": userToken
      },
      body: formData,
    });
  
    const data = await res.json();
    return data;
  };
  
  export default editVacation;