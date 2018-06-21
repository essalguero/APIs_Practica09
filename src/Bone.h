#pragma once

#include "common.h"

#include <vector>

class Bone
{
public:
	Bone(const char* name, int parentIndex);
	const char* getName() const;
	int getParentIndex() const;
	const glm::mat4& getInvPoseMatrix() const;
	void setInvPoseMatrix(const glm::mat4& m);
	void addPosition(uint16_t frame, const glm::vec3& position);
	void addRotation(uint16_t frame, const glm::quat& rotation);
	void addScale(uint16_t frame, const glm::vec3& scale);
	glm::mat4 calculateAnimMatrix(float frame) const;
	glm::vec3 calculatePosition(float frame) const;
	glm::quat calculateRotation(float frame) const;
	glm::vec3 calculateScale(float frame) const;
	

private:
	int boneParentIndex = -1;
	char boneName [255];

	glm::mat4 invPoseMatrix;
	glm::mat4 animationMatrix;

	std::vector<std::pair<uint16_t, glm::vec3> > positionsVector;
	std::vector<std::pair<uint16_t, glm::vec3> > scaleVector;
	std::vector<std::pair<uint16_t, glm::quat> > rotationsQuads;


};