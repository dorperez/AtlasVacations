import VacationType from "../types/VacationType"

const addNewVacation = async (
    userToken: string,
    newVacation: VacationType,
    imageFile: File
) => {
    const url = "http://localhost:3000/vacation/add/";
    const formData = new FormData();

    formData.append("title", newVacation.title);
    formData.append("description", newVacation.description);
    formData.append("startDate", newVacation.startDate.toString());
    formData.append("endDate", newVacation.endDate.toString());
    formData.append("price", newVacation.price.toString());
    formData.append("image", imageFile);

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "x-auth-token": userToken,
        },
        body: formData,
    });

    const data = await res.json();
    return data;
};

export default addNewVacation