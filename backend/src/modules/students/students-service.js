const { ApiError, sendAccountVerificationEmail } = require("../../utils");
const { findAllStudents, findStudentDetail, findStudentToSetStatus, addOrUpdateStudent, deleteStudentById } = require("./students-repository");
const { findUserById } = require("../../shared/repository");

const checkStudentId = async (id) => {
    const isStudentFound = await findUserById(id);
    if (!isStudentFound) {
        throw new ApiError(404, "Student not found");
    }
}

const getAllStudents = async (payload) => {
    const students = await findAllStudents(payload);
    if (students.length <= 0) {
        throw new ApiError(404, "Students not found");
    }

    return students;
}

const getStudentDetail = async (id) => {
    await checkStudentId(id);

    const student = await findStudentDetail(id);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    return student;
}

const validateStudentData = (data, isUpdate = false) => {
    // Validate required fields
    if (!data?.name || !data?.email) {
        throw new ApiError(400, 'Name and email are required fields');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data?.email)) {
        throw new ApiError(400, 'Invalid email format');
    }

    // For updates, validate userId
    if (isUpdate && (!data?.userId || isNaN(parseInt(data?.userId)))) {
        throw new ApiError(400, 'Invalid student ID');
    }

    return true;
};

const addNewStudent = async (payload) => {
    // Validate input data
    validateStudentData(payload, false);

    const ADD_STUDENT_AND_EMAIL_SEND_SUCCESS = "Student added and verification email sent successfully.";
    const ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL = "Student added, but failed to send verification email.";
    try {
        const result = await addOrUpdateStudent(payload);
        if (!result.status) {
            throw new ApiError(500, result.message);
        }

        try {
            await sendAccountVerificationEmail({ userId: result.userId, userEmail: payload.email });
            return { message: ADD_STUDENT_AND_EMAIL_SEND_SUCCESS };
        } catch (error) {
            return { message: ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL }
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Unable to add student");
    }
}

const updateStudent = async (payload) => {
    // Validate input data
    validateStudentData(payload, true);

    const result = await addOrUpdateStudent(payload);
    if (!result.status) {
        throw new ApiError(500, result.message);
    }

    return { message: result.message };
}

const setStudentStatus = async ({ userId, reviewerId, status }) => {
    // Validate userId
    if (!userId || isNaN(parseInt(userId))) {
        throw new ApiError(400, 'Invalid student ID');
    }

    // Validate status
    if (typeof status !== 'boolean') {
        throw new ApiError(400, 'Status must be a boolean value');
    }

    await checkStudentId(userId);

    const affectedRow = await findStudentToSetStatus({ userId, reviewerId, status });
    if (affectedRow <= 0) {
        throw new ApiError(500, "Unable to change student status");
    }

    return { message: "Student status changed successfully" };
}

const deleteStudent = async (id) => {
    // Validate id
    if (!id || isNaN(parseInt(id))) {
        throw new ApiError(400, 'Invalid student ID');
    }

    await checkStudentId(id);

    const affectedRow = await deleteStudentById(id);
    if (affectedRow <= 0) {
        throw new ApiError(500, "Unable to delete student");
    }

    return { message: "Student deleted successfully" };
}

module.exports = {
    getAllStudents,
    getStudentDetail,
    addNewStudent,
    setStudentStatus,
    updateStudent,
    deleteStudent,
};
