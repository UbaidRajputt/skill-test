const asyncHandler = require("express-async-handler");
const { getAllStudents, addNewStudent, getStudentDetail, setStudentStatus, updateStudent, deleteStudent } = require("./students-service");

const handleGetAllStudents = asyncHandler(async (req, res) => {
    // Extract allowed query parameters
    const { name, className, section, roll } = req.query;
    const queryParams = { name, className, section, roll };
    
    const students = await getAllStudents(queryParams);
    res.json({ students });
});

const handleAddStudent = asyncHandler(async (req, res) => {

    const result = await addNewStudent(req.body);
    res.status(201).json(result);
});

const handleUpdateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await updateStudent({
        userId: parseInt(id),
        ...req.body,
    });
    res.json(result);
});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const student = await getStudentDetail(parseInt(id));
    res.json(student);
});

const handleStudentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { id: reviewerId } = req.user;
    
    const payload = { userId: parseInt(id), reviewerId, status };
    const result = await setStudentStatus(payload);
    res.json(result);
});

const handleDeleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await deleteStudent(parseInt(id));
    res.json(result);
});

module.exports = {
    handleGetAllStudents,
    handleGetStudentDetail,
    handleAddStudent,
    handleStudentStatus,
    handleUpdateStudent,
    handleDeleteStudent,
};
