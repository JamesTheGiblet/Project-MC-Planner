QUnit.module('DependencyResolver', function() {
    const resolver = new DependencyResolver(componentData);

    QUnit.test('should return empty array for component with no dependencies', function(assert) {
        const deps = resolver.getComponentDependencies('dht22', 'rpi4');
        assert.deepEqual(deps, [], 'DHT22 has no dependencies');
    });

    QUnit.test('should identify a required dependency', function(assert) {
        const deps = resolver.getComponentDependencies('ds18b20', 'rpi4');
        assert.strictEqual(deps.length, 1, 'DS18B20 has one dependency');
        assert.strictEqual(deps[0].type, 'resistor', 'Dependency is a resistor');
        assert.strictEqual(deps[0].requiredStatus, true, 'Dependency is required');
    });

    QUnit.test('should handle board-specific dependency requirements (required case)', function(assert) {
        // HC-SR04 requires a level shifter on 3.3V boards like RPi4
        const deps = resolver.getComponentDependencies('ultrasonic_hcsr04', 'rpi4');
        const levelShifterDep = deps.find(d => d.type === 'level_shifter');
        assert.ok(levelShifterDep, 'Level shifter dependency found for RPi4');
        assert.strictEqual(levelShifterDep.requiredStatus, true, 'Level shifter is required for RPi4');
    });

    QUnit.test('should handle board-specific dependency requirements (not required case)', function(assert) {
        // HC-SR04 does NOT require a level shifter on 5V boards like Arduino Uno
        const deps = resolver.getComponentDependencies('ultrasonic_hcsr04', 'uno');
        const levelShifterDep = deps.find(d => d.type === 'level_shifter');
        assert.ok(levelShifterDep, 'Level shifter dependency found for Uno');
        assert.strictEqual(levelShifterDep.requiredStatus, false, 'Level shifter is NOT required for Uno');
        assert.strictEqual(levelShifterDep.boardReason, 'Arduino Uno operates at 5V', 'Correct reason is provided');
    });

    QUnit.test('should identify an optional dependency', function(assert) {
        // Servo motor has an optional external power supply
        const deps = resolver.getComponentDependencies('servo', 'rpi4');
        const powerDep = deps.find(d => d.type === 'power_supply');
        assert.ok(powerDep, 'Power supply dependency found for servo');
        assert.strictEqual(powerDep.requiredStatus, 'optional', 'Power supply is optional');
    });

    QUnit.test('should handle multiple dependencies', function(assert) {
        const deps = resolver.getComponentDependencies('mpu6050', 'rpi4');
        assert.strictEqual(deps.length, 2, 'MPU6050 has two dependencies');
        
        const resistorDep = deps.find(d => d.type === 'resistor');
        assert.ok(resistorDep, 'Resistor dependency found');
        assert.strictEqual(resistorDep.requiredStatus, true, 'Pull-up resistors are required');
    });
});