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

	scalesVector.push_back(newScale);
}

glm::mat4 Bone::calculateAnimMatrix(float frame) const
{
	glm::mat4 animMatrix = glm::mat4();

	glm::vec3 positionVector = calculatePosition(frame);
	glm::vec3 scaleVector = calculateScale(frame);
	glm::quat rotationQuaternion = calculateRotation(frame);

	glm::mat4 translate = glm::translate(animMatrix, positionVector);
	glm::mat4 rotate = glm::rotate(translate, glm::angle(rotationQuaternion), glm::axis(rotationQuaternion));
	glm::mat4 scale = glm::scale(rotate, scaleVector);

	return 	scale;
}

glm::vec3 Bone::calculatePosition(float frame) const
{
	if (positionsVector.size() == 0)
		return glm::vec3();

	for (int i = 0; i < positionsVector.size(); ++i)
	{
		if (positionsVector.at(i).first == frame)
		{
			return positionsVector.at(i).second;
		}
		else
		{
			if (positionsVector.at(i).first > frame)
			{
				int frameAnterior = positionsVector.at(i - 1).first;

				float a = (frame - frameAnterior) / (positionsVector.at(i).first - frameAnterior);

				glm::vec3 interpolatedVertor = glm::mix(positionsVector.at(i - 1).second,
					positionsVector.at(i).second, a);

				return interpolatedVertor;
			}
		}
	}

	// devolver el ultimo si se ha llegado al final
	return positionsVector.at(positionsVector.size() - 1).second;
}

glm::quat Bone::calculateRotation(float frame) const
{
	if (rotationsQuads.size() == 0)
		return glm::quat();

	for (int i = 0; i < rotationsQuads.size(); ++i)
	{
		if (rotationsQuads.at(i).first == frame)
		{
			return rotationsQuads.at(i).second;
		}
		else
		{
			if (rotationsQuads.at(i).first > frame)
			{
				int frameAnterior = rotationsQuads.at(i - 1).first;

				float a = (frame - frameAnterior) / (rotationsQuads.at(i).first - frameAnterior);

				glm::quat interpolatedsQuads = glm::slerp(rotationsQuads.at(i - 1).second,
					rotationsQuads.at(i).second, a);

				return interpolatedsQuads;
			}
		}
	}

	// devolver el ultimo si se ha llegado al final
	return rotationsQuads.at(rotationsQuads.size() - 1).second;
}

glm::vec3 Bone::calculateScale(float frame) const
{
	int boneUsed;

	if (scalesVector.size() == 0)
		return glm::vec3();

	for (int i = 0; i < scalesVector.size(); ++i)
	{
		if (scalesVector.at(i).first == frame)
		{
			return scalesVector.at(i).second;
		}
		else
		{
			if (scalesVector.at(i).first > frame)
			{
				int frameAnterior = scalesVector.at(i - 1).first;

				float a = (frame - frameAnterior) / (scalesVector.at(i).first - frameAnterior);

				glm::vec3 interpolatedVertor = glm::mix(scalesVector.at(i - 1).second,
					scalesVector.at(i).second, a);

				return interpolatedVertor;
			}
		}
	}

	// devolver el ultimo si se ha llegado al final
	return scalesVector.at(scalesVector.size() - 1).second;
}