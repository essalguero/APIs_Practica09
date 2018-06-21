#include "Bone.h"

Bone::Bone(const char* name, int parentIndex)
{
	strcpy_s(boneName, name);

	boneParentIndex = parentIndex;
}

const char* Bone::getName() const
{
	return boneName;
}

int Bone::getParentIndex() const
{
	return boneParentIndex;
}

const glm::mat4& Bone::getInvPoseMatrix() const
{
	return invPoseMatrix;
}

void Bone::setInvPoseMatrix(const glm::mat4& m)
{
	invPoseMatrix = m;
}

void Bone::addPosition(uint16_t frame, const glm::vec3& position)
{
	std::pair<int, glm::vec3> newPosition;

	newPosition.first = frame;
	newPosition.second = position;

	positionsVector.push_back(newPosition);
}

void Bone::addRotation(uint16_t frame, const glm::quat& rotation)
{
	std::pair<int, glm::quat> newRotation;

	newRotation.first = frame;
	newRotation.second = rotation;

	rotationsQuads.push_back(newRotation);
}

void Bone::addScale(uint16_t frame, const glm::vec3& scale)
{
	std::pair<int, glm::vec3> newScale;

	newScale.first = frame;
	newScale.second = scale;

	positionsVector.push_back(newScale);
}

glm::mat4 Bone::calculateAnimMatrix(float frame) const
{
	return glm::mat4(1.0f);
}

glm::vec3 Bone::calculatePosition(float frame) const
{
	return glm::vec3(1.0f);
}

glm::quat Bone::calculateRotation(float frame) const
{
	return glm::quat();
}

glm::vec3 Bone::calculateScale(float frame) const
{
	return glm::vec3(1.0f);
}