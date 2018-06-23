#pragma once

#include "common.h"
#include "Entity.h"
#include "Mesh.h"


class Model : public Entity
{
public:

	Model(const std::shared_ptr<Mesh>& mesh);
	virtual void draw() override;
	//virtual void update(float deltaTime) override;

	void animate(bool animate);
	int getFps() const;
	void setFps(int fps);
	float getCurrentFrame() const;
	void setCurrentFrame(float frame);
	void calculateAnimMatrices(float frame, const std::vector<Bone>& bones);

	void update(float deltaTime);
	
private:
	shared_ptr<Mesh> mesh;

	std::shared_ptr<std::vector<glm::mat4> > animationsMatrix;
	int animationFps;
	bool modelAnimate;
	float animationFrame;
};